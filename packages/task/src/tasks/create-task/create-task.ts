import { DvelopContext } from "@dvelop-sdk/core";
import { HttpConfig, HttpResponse, _defaultHttpRequestFunction } from "../../utils/http";
import { v4 } from "uuid";

export interface CreateTaskParams {
  subject: string;
  assignees: string[];
  correlationKey?: string;
  description?: string;
  priority?: number,
  reminderDate?: Date;
  dueDate?: Date;
  retentionTime?: string;
  context?: {
    key?: string;
    type?: string;
    name?: string;
  },
  metadata?: {
    key?: string;
    caption?: string;
    type?: "String" | "Number" | "Money" | "Date";
    values?: string;
  }[];
  dmsReferences?: {
    repoId?: string;
    objectId?: string;
  }[];
  sendCreationNotification?: boolean;
  sendCompletionNotification?: boolean;
  sendDueDateNotification?: boolean;
  _links?: {
    form?: { href: string; };
    callback?: { href: string; };
    attachment?: { href: string; };
    process?: { href: string; };
    changeCallback?: { href: string; };
  }
}

/**
 * Default transform-function provided to the {@link createTask}-function.
 * @internal
 * @category Task
 */
export function _createTaskDefaultTransformFunction(response: HttpResponse, _: DvelopContext, __: CreateTaskParams): string {
  return response.headers["location"];
}

/**
 * Factory for the {@link createTask}-function. See internals for more information.
 * @typeparam T Return type of the {@link createTask}-function. A corresponding transformFuntion has to be supplied.
 * @internal
 * @category Task
 */
export function _createTaskFactory<T>(
  httpRequestFunction: (context: DvelopContext, config: HttpConfig) => Promise<HttpResponse>,
  transformFunction: (response: HttpResponse, context: DvelopContext, params: CreateTaskParams) => T,
  uuidGeneratorFunction?: () => string
): (context: DvelopContext, params: CreateTaskParams) => Promise<T> {

  return async (context: DvelopContext, params: CreateTaskParams) => {

    if (uuidGeneratorFunction && !params.correlationKey) {
      params.correlationKey = uuidGeneratorFunction();
    }

    const response: HttpResponse = await httpRequestFunction(context, {
      method: "POST",
      url: "/task",
      follows: ["tasks"],
      data: params
    });
    return transformFunction(response, context, params);
  };
}

/**
 * Create a task.
 *
 * ```typescript
 * ```
 *
 * @category Task
 */
/* istanbul ignore next */
export function createTask(context: DvelopContext, params: CreateTaskParams): Promise<string> {
  return _createTaskFactory(_defaultHttpRequestFunction, _createTaskDefaultTransformFunction, v4)(context, params);
}