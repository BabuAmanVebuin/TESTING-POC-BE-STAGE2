import * as E from "fp-ts/lib/Either.js"
import * as O from "fp-ts/Option"
import { Task } from "../../../domain/models/Task.js"
import { ApplicationError } from "../../errors/dpm/index.js"

export type TaskRepositoryPort = {
  findAll: () => Promise<Task[]>
  findById: (id: number) => Promise<O.Option<Task>>
  create: (id: number, title: string, description: string) => Promise<E.Either<ApplicationError, Task>>
  update: (id: number, title: string, description: string) => Promise<E.Either<ApplicationError, string>>
  delete_: (id: number) => Promise<void>
}
