import express from "express"
import { expect } from "chai"
import { Transaction } from "sequelize"
import request from "supertest"
import { createRouter } from "../../../src/infrastructure/webserver/express/routes.js"
import {
  startTransaction,
  insertFixture,
  closeTransaction,
  selectFixture,
  startTransactionCmn,
  closeTransactionCmn,
  insertFixtureCmn,
} from "../sequelize/index.js"
import { getTransaction } from "../../../src/infrastructure/orm/sqlize/index.js"

const app = express()
app.use(express.json())
app.use("/", createRouter())

// Insert fixtures before each test
const beforeEachHookFixtures = (transaction: Transaction) => async (cmnTransaction: Transaction) => {
  await Promise.all([
    insertFixture("beforeUpdateTasks.sql", transaction),
    (async () => {
      await insertFixtureCmn("beforeUpdateTasksCmnDB.sql", cmnTransaction)
    })(),
  ])
}

describe("Create Tasks", async () => {
  beforeEach(async () => startTransaction((transaction) => startTransactionCmn(beforeEachHookFixtures(transaction))))

  afterEach(async () => {
    await closeTransaction()
    await closeTransactionCmn()
  })

  it('Success Request - Must update Task if "remarks" length is less than 5000 characters', async () => {
    // Payload with remarks length less than 5000 characters
    const requestData = {
      "operate-user-id": "test1@user.com",
      tasks: [
        {
          "task-id": 1,
          "power-plant-id": "HE_",
          "asset-task-group-id": 1,
          "event-name": "Event 1",
          "event-type-id": 1,
          "task-type-id": 1,
          "task-category-id": 1,
          "takeover-team-id": 1,
          "task-name": "Task 1",
          "task-priority-id": 1,
          "planned-date-time": "2023-06-28T21:12:00.000Z",
          "due-date-time": "2023-10-08T20:55:00.000Z",
          "task-status-id": 1,
          "estimated-task-time": null,
          "order-id": "010000000030",
          "routing-id": 100000030,
          "routing-counter": 2,
          remarks: "test remarks",
          "asset-code": "HE_A100 CBM510 PG008",
        },
      ],
    }
    // Call update-task API
    const res = await request(app).patch(`/tasks`).send(requestData)
    // Expected response
    expect(res.status).to.eql(200)
    expect(res.body).to.eql("OK")

    // Check if remarks is updated
    const transaction = getTransaction()
    const updatedTasks = (await selectFixture("afterUpdateTasks.sql", transaction, {
      taskId: requestData.tasks[0]["task-id"],
    })) as { REMARKS: string }[]

    // Expect updated remarks to be equal to remarks in request data
    expect(updatedTasks[0].REMARKS).to.eql(requestData.tasks[0].remarks)
  })

  it('Must return "Bad Request" response if "remarks" length is greater than 5000 characters', async () => {
    // Payload with remarks length greater than 5000 characters
    const requestData = {
      "operate-user-id": "test1@user.com",
      tasks: [
        {
          "task-id": 1,
          "power-plant-id": "HE_",
          "asset-task-group-id": 1,
          "event-name": "Event 1",
          "event-type-id": 1,
          "task-type-id": 1,
          "task-category-id": 1,
          "takeover-team-id": 1,
          "task-name": "Task 1",
          "task-priority-id": 1,
          "planned-date-time": "2023-06-28T21:12:00.000Z",
          "due-date-time": "2023-10-08T20:55:00.000Z",
          "task-status-id": 1,
          "estimated-task-time": null,
          "order-id": "010000000030",
          "routing-id": 100000030,
          "routing-counter": 2,
          remarks:
            "Vivamus mollis placerat diam, sit amet porta leo semper et. Nullam convallis augue aliquet urna blandit, a sollicitudin purus condimentum. Donec non nulla hendrerit justo sagittis tempus vitae in lectus. Etiam luctus lectus et sapien varius semper. Pellentesque pellentesque, lacus egestas tristique rhoncus, eros purus venenatis metus, porttitor fermentum ligula lorem ut ligula. Aliquam volutpat placerat imperdiet. Nam semper nisl tincidunt, iaculis libero id, auctor dui. Nam posuere viverra hendrerit. Morbi sit amet blandit massa. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Vestibulum tincidunt imperdiet mi non dignissim. Pellentesque rutrum tellus eget neque consectetur, non tincidunt metus gravida. Fusce tempor, mauris et euismod sagittis, quam nibh luctus tellus, a accumsan dui sapien nec sem. Aenean eu vestibulum elit, a vulputate nulla. Nulla sit amet libero leo. Donec massa purus, ultrices ac mauris quis, vulputate interdum metus.Vivamus mollis placerat diam, sit amet porta leo semper et. Nullam convallis augue aliquet urna blandit, a sollicitudin purus condimentum. Donec non nulla hendrerit justo sagittis tempus vitae in lectus. Etiam luctus lectus et sapien varius semper. Pellentesque pellentesque, lacus egestas tristique rhoncus, eros purus venenatis metus, porttitor fermentum ligula lorem ut ligula. Aliquam volutpat placerat imperdiet. Nam semper nisl tincidunt, iaculis libero id, auctor dui. Nam posuere viverra hendrerit. Morbi sit amet blandit massa. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Vestibulum tincidunt imperdiet mi non dignissim. Pellentesque rutrum tellus eget neque consectetur, non tincidunt metus gravida. Fusce tempor, mauris et euismod sagittis, quam nibh luctus tellus, a accumsan dui sapien nec sem. Aenean eu vestibulum elit, a vulputate nulla. Nulla sit amet libero leo. Donec massa purus, ultrices ac mauris quis, vulputate interdum metus.Vivamus mollis placerat diam, sit amet porta leo semper et. Nullam convallis augue aliquet urna blandit, a sollicitudin purus condimentum. Donec non nulla hendrerit justo sagittis tempus vitae in lectus. Etiam luctus lectus et sapien varius semper. Pellentesque pellentesque, lacus egestas tristique rhoncus, eros purus venenatis metus, porttitor fermentum ligula lorem ut ligula. Aliquam volutpat placerat imperdiet. Nam semper nisl tincidunt, iaculis libero id, auctor dui. Nam posuere viverra hendrerit. Morbi sit amet blandit massa. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Vestibulum tincidunt imperdiet mi non dignissim. Pellentesque rutrum tellus eget neque consectetur, non tincidunt metus gravida. Fusce tempor, mauris et euismod sagittis, quam nibh luctus tellus, a accumsan dui sapien nec sem. Aenean eu vestibulum elit, a vulputate nulla. Nulla sit amet libero leo. Donec massa purus, ultrices ac mauris quis, vulputate interdum metus.Vivamus mollis placerat diam, sit amet porta leo semper et. Nullam convallis augue aliquet urna blandit, a sollicitudin purus condimentum. Donec non nulla hendrerit justo sagittis tempus vitae in lectus. Etiam luctus lectus et sapien varius semper. Pellentesque pellentesque, lacus egestas tristique rhoncus, eros purus venenatis metus, porttitor fermentum ligula lorem ut ligula. Aliquam volutpat placerat imperdiet. Nam semper nisl tincidunt, iaculis libero id, auctor dui. Nam posuere viverra hendrerit. Morbi sit amet blandit massa. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Vestibulum tincidunt imperdiet mi non dignissim. Pellentesque rutrum tellus eget neque consectetur, non tincidunt metus gravida. Fusce tempor, mauris et euismod sagittis, quam nibh luctus tellus, a accumsan dui sapien nec sem. Aenean eu vestibulum elit, a vulputate nulla. Nulla sit amet libero leo. Donec massa purus, ultrices ac mauris quis, vulputate interdum metus.Vivamus mollis placerat diam, sit amet porta leo semper et. Nullam convallis augue aliquet urna blandit, a sollicitudin purus condimentum. Donec non nulla hendrerit justo sagittis tempus vitae in lectus. Etiam luctus lectus et sapien varius semper. Pellentesque pellentesque, lacus egestas tristique rhoncus, eros purus venenatis metus, porttitor fermentum ligula lorem ut ligula. Aliquam volutpat placerat imperdiet. Nam semper nisl tincidunt, iaculis libero id, auctor dui. Nam posuere viverra hendrerit. Morbi sit amet blandit massa. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Vestibulum tincidunt imperdiet mi non dignissim. Pellentesque rutrum tellus eget neque consectetur, non tincidunt metus gravida. Fusce tempor, mauris et euismod sagittis, quam nibh luctus tellus, a accumsan dui sapien nec sem. Aenean eu vestibulum elit, a vulputate nulla. Nulla sit amet libero leo. Donec massa purus, ultrices ac mauris quis, vulputate interdum metus. Donec massa purus, ultrices vulputate.",
        },
      ],
    }

    // Call update-task API
    const res = await request(app).patch(`/tasks`).send(requestData)
    // Expect Bad Request response
    expect(res.status).to.eql(400)
    // Expect Bad Request response body
    expect(res.body).to.eql("Bad Request")
  })

  it("Must return task-id not found error for invalid task-id", async () => {
    // Payload with invalid task-id
    const requestData = {
      "operate-user-id": "test1@user.com",
      tasks: [
        {
          "task-id": 78745645,
          "power-plant-id": "HE_",
          "asset-task-group-id": 1,
          "event-name": "Event 1",
          "event-type-id": 1,
          "task-type-id": 1,
          "task-category-id": 1,
          "takeover-team-id": 1,
          "task-name": "Task 1",
          "task-priority-id": 1,
          "planned-date-time": "2023-06-28T21:12:00.000Z",
          "due-date-time": "2023-10-08T20:55:00.000Z",
          "task-status-id": 1,
          "estimated-task-time": null,
          "order-id": "010000000030",
          "routing-id": 100000030,
          "routing-counter": 2,
          remarks: "test remarks",
        },
      ],
    }
    // Call update-task API
    const res = await request(app).patch(`/tasks`).send(requestData)
    // Expected response
    expect(res.status).to.eql(404)
    expect(res.body).have.property("errors")
    expect(res.body["errors"]).to.be.an("array")
    expect(res.body["errors"][0]).have.property("error-type")
    expect(res.body["errors"][0]["error-type"]).to.eql("NOT_FOUND_TASK_ID")
  })

  it("Must return event-template not found error for invalid event-type-id in event-template relation", async () => {
    // Payload with invalid event-type-id in event-template relation
    const requestData = {
      "operate-user-id": "test1@user.com",
      tasks: [
        {
          "task-id": 1,
          "power-plant-id": "HE_",
          "asset-task-group-id": 1,
          "event-name": "Event 1",
          "event-type-id": 2,
          "task-type-id": 1,
          "task-category-id": 1,
          "takeover-team-id": 1,
          "task-name": "Task 1",
          "task-priority-id": 1,
          "planned-date-time": "2023-06-28T21:12:00.000Z",
          "due-date-time": "2023-10-08T20:55:00.000Z",
          "task-status-id": 1,
          "estimated-task-time": null,
          "order-id": "010000000030",
          "routing-id": 100000030,
          "routing-counter": 2,
          remarks: "test remarks",
        },
      ],
    }
    // Call update-task API
    const res = await request(app).patch(`/tasks`).send(requestData)
    // Expected response
    expect(res.status).to.eql(404)
    expect(res.body).have.property("errors")
    expect(res.body["errors"]).to.be.an("array")
    expect(res.body["errors"][0]).have.property("error-type")
    expect(res.body["errors"][0]["error-type"]).to.eql("NOT_FOUND_EVENT_TYPE_ID_OR_TASK_TYPE_ID")
  })

  it("Must return event-template not found error for invalid task-type-id in event-template relation", async () => {
    // Payload with invalid task-type-id in event-template relation
    const requestData = {
      "operate-user-id": "test1@user.com",
      tasks: [
        {
          "task-id": 1,
          "power-plant-id": "HE_",
          "asset-task-group-id": 1,
          "event-name": "Event 1",
          "event-type-id": 1,
          "task-type-id": 2,
          "task-category-id": 1,
          "takeover-team-id": 1,
          "task-name": "Task 1",
          "task-priority-id": 1,
          "planned-date-time": "2023-06-28T21:12:00.000Z",
          "due-date-time": "2023-10-08T20:55:00.000Z",
          "task-status-id": 1,
          "estimated-task-time": null,
          "order-id": "010000000030",
          "routing-id": 100000030,
          "routing-counter": 2,
          remarks: "test remarks",
        },
      ],
    }
    // Call update-task API
    const res = await request(app).patch(`/tasks`).send(requestData)
    // Expected response
    expect(res.status).to.eql(404)
    expect(res.body).have.property("errors")
    expect(res.body["errors"]).to.be.an("array")
    expect(res.body["errors"][0]).have.property("error-type")
    expect(res.body["errors"][0]["error-type"]).to.eql("NOT_FOUND_EVENT_TYPE_ID_OR_TASK_TYPE_ID")
  })

  it("Must return asset-code not found error for invalid asset-code", async () => {
    // Payload with invalid asset-code
    const requestData = {
      "operate-user-id": "test1@user.com",
      tasks: [
        {
          "task-id": 1,
          "power-plant-id": "HE_",
          "asset-task-group-id": 1,
          "event-name": "Event 1",
          "event-type-id": 1,
          "task-type-id": 2,
          "task-category-id": 1,
          "takeover-team-id": 1,
          "task-name": "Task 1",
          "task-priority-id": 1,
          "planned-date-time": "2023-06-28T21:12:00.000Z",
          "due-date-time": "2023-10-08T20:55:00.000Z",
          "task-status-id": 1,
          "estimated-task-time": null,
          "order-id": "010000000030",
          "routing-id": 100000030,
          "routing-counter": 2,
          remarks: "test remarks",
          "asset-code": "INVALID_ASSET_CODE",
        },
      ],
    }
    // Call update-task API
    const res = await request(app).patch(`/tasks`).send(requestData)
    // Expected response
    expect(res.status).to.eql(404)
    expect(res.body).have.property("errors")
    expect(res.body["errors"]).to.be.an("array")
    expect(res.body["errors"][0]).have.property("error-type")
    expect(res.body["errors"][0]["error-type"]).to.eql("NOT_FOUND_ASSET_CODE")
  })
})
