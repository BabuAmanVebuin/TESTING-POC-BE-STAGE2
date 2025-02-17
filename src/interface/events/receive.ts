// Initially copied from ToT-BE, commit 545c1dd02ed8df920e315645df162212e80b2a03
import { EventHubConsumerClient, MessagingError, SubscribeOptions } from "@azure/event-hubs"
import { ContainerClient } from "@azure/storage-blob"
import { BlobCheckpointStore } from "@azure/eventhubs-checkpointstore-blob"
import logger, { uuidContextWrapper } from "../../infrastructure/logger.js"
import { env } from "../../infrastructure/env/index.js"
import { createPlantMaintenanceOrder } from "../controllers/tot/v1/createPlantMaintenanceOrderController.js"
import { retryFn } from "../utils.js"

// this code is initial event receive
export const receiver = async (): Promise<void> => {
  const connectionString: string = env.EVH_MAINTENANCE_ORDER_CONNECTION_STRING
  const eventHubName = env.EVH_MAINTENANCE_ORDER_TOPIC
  const consumerGroup = env.CONSUMER_GROUP || EventHubConsumerClient.defaultConsumerGroupName // name of the default consumer group
  const storageConnectionString = env.EVH_SA_CONNECTION_STRING
  const containerName = env.CHECKPOINT_MAINTENANCE_ORDER_CONTAINER_NAME
  // Create a blob container client and a blob checkpoint store using the client.
  const containerClient = new ContainerClient(storageConnectionString, containerName)
  const checkpointStore = new BlobCheckpointStore(containerClient)

  // Create a consumer client for the event hub by specifying the checkpoint store.
  const consumerClient = new EventHubConsumerClient(consumerGroup, connectionString, eventHubName, checkpointStore)
  // Subscribe to the events, and specify handlers for processing the events and errors.
  const subscriber = consumerClient.subscribe(
    {
      processEvents: async (events, context) => {
        await uuidContextWrapper(async () => {
          logger.info(`[${context.eventHubName}] Event Received: ${JSON.stringify(events)}`)
          if (events.length === 0) {
            return
          }

          for (const event of events) {
            // insert or update record tables
            await retryFn(async () => {
              await createPlantMaintenanceOrder(event.body)
            })
          }
          // Update the checkpoint.
          await context.updateCheckpoint(events[events.length - 1])
        })
      },

      processError: async (error: Error | MessagingError, context) => {
        logger.warn(`[${context.eventHubName}] processError caught an error.`)
        logger.error(error)
        logger.warn(JSON.stringify(context.lastEnqueuedEventProperties))
      },
    },
    {
      trackLastEnqueuedEventProperties: true,
    } as SubscribeOptions,
  )

  const endProcess = async () => {
    await new Promise<void>((resolve) => {
      setTimeout(async () => {
        await subscriber.close()
        await consumerClient.close()
        resolve()
      }, 30 * 1000)
    })
  }
  process.on("beforeExit", endProcess)
}
