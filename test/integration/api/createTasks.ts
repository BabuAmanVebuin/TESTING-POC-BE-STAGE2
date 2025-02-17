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
  insertFixtureCmn,
  startTransactionCmn,
  closeTransactionCmn,
} from "../sequelize/index.js"
import { getTransaction } from "../../../src/infrastructure/orm/sqlize/index.js"

const app = express()
app.use(express.json())
app.use("/", createRouter())

// Insert fixtures before each test
const beforeEachHookFixtures = (transaction: Transaction) => async (cmnTransaction: Transaction) => {
  await Promise.all([
    insertFixture("beforeCreateTasks.sql", transaction),
    insertFixtureCmn("beforeCreateTasksCmnDB.sql", cmnTransaction),
  ])
}

describe("Create Tasks", async () => {
  beforeEach(async () => startTransaction((transaction) => startTransactionCmn(beforeEachHookFixtures(transaction))))

  afterEach(async () => {
    await closeTransaction()
    await closeTransactionCmn()
  })

  it('Success Request - Must create Task if "remarks" length is less than 5000 characters', async () => {
    // payload with remarks length less than 5000 characters
    const requestData = {
      "operate-user-id": "test1@user.com",
      tasks: [
        {
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
    // Call create-task API
    const res = await request(app).post(`/tasks`).send(requestData)

    // expected API response
    expect(res.status).to.eql(201)
    expect(res.body).to.be.an("array")
    expect(res.body[0]).have.property("task-id")
    expect(res.body[0]["task-id"]).to.be.a("number")

    // Check if task is created in database
    const transaction = getTransaction()
    const createdTasks = (await selectFixture("afterCreateTasks.sql", transaction, {
      taskId: res.body[0]["task-id"],
    })) as { REMARKS: string }[]

    // Expect database remarks to be equal to remarks in request payload
    expect(createdTasks[0].REMARKS).to.eql(requestData.tasks[0].remarks)
  })

  it('Must return "Bad Request" response if "remarks" length is greater than 5000 characters', async () => {
    // payload with remarks length greater than 5000 characters
    const requestData = {
      "operate-user-id": "test1@user.com",
      tasks: [
        {
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

    // Call create-task API
    const res = await request(app).post(`/tasks`).send(requestData)

    // expect Bad Request response
    expect(res.status).to.eql(400)
    // expect response body to be 'Bad Request'
    expect(res.body).to.eql("Bad Request")
  })

  it("Must return event-template not found error for invalid event-type-id in event-template relation", async () => {
    // Payload with invalid event-type-id in event-template relation
    const requestData = {
      "operate-user-id": "test1@user.com",
      tasks: [
        {
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
          remarks: "Test remarks",
        },
      ],
    }

    // Call create-task API
    const res = await request(app).post(`/tasks`).send(requestData)

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
          remarks: "Test remarks",
        },
      ],
    }

    // Call create-task API
    const res = await request(app).post(`/tasks`).send(requestData)

    // Expected response
    expect(res.status).to.eql(404)
    expect(res.body).have.property("errors")
    expect(res.body["errors"]).to.be.an("array")
    expect(res.body["errors"][0]).have.property("error-type")
    expect(res.body["errors"][0]["error-type"]).to.eql("NOT_FOUND_EVENT_TYPE_ID_OR_TASK_TYPE_ID")
  })

  it("Must return sap-task-category-id not found error for invalid sap-task-category-id", async () => {
    // Payload with invalid sap-task-category-id
    const requestData = {
      "operate-user-id": "test1@user.com",
      tasks: [
        {
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
          remarks: "Test remarks",
          "sap-task-category-id": 2,
        },
      ],
    }

    // Call create-task API
    const res = await request(app).post(`/tasks`).send(requestData)

    // Expected response
    expect(res.status).to.eql(404)
    expect(res.body).have.property("errors")
    expect(res.body["errors"]).to.be.an("array")
    expect(res.body["errors"][0]).have.property("error-type")
    expect(res.body["errors"][0]["error-type"]).to.eql("NOT_FOUND_SAP_TASK_CATEGORY_ID")
  })

  it("Must return asset-code not found error for invalid asset-code", async () => {
    // Payload with invalid sap-task-category-id
    const requestData = {
      "operate-user-id": "test1@user.com",
      tasks: [
        {
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
          remarks: "Test remarks",
          "asset-code": "INVALID_ASSET_CODE",
        },
      ],
    }

    // Call create-task API
    const res = await request(app).post(`/tasks`).send(requestData)

    // Expected response
    expect(res.status).to.eql(404)
    expect(res.body).have.property("errors")
    expect(res.body["errors"]).to.be.an("array")
    expect(res.body["errors"][0]).have.property("error-type")
    expect(res.body["errors"][0]["error-type"]).to.eql("NOT_FOUND_ASSET_CODE")
  })
})
