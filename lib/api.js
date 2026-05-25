// Helpers that keep API responses to a consistent envelope:
//   { data, error } with the appropriate HTTP status code.
import { NextResponse } from "next/server";

export function ok(data, status = 200) {
  return NextResponse.json({ data, error: null }, { status });
}

export function fail(message, status = 400) {
  return NextResponse.json({ data: null, error: message }, { status });
}

export const PRIORITIES = ["HIGH", "MEDIUM", "LOW"];
export const STATUSES = ["PENDING", "COMPLETED"];

export function validateTaskPayload(body, { partial = false } = {}) {
  const errors = [];
  const data = {};

  if (!partial || body.title !== undefined) {
    if (typeof body.title !== "string" || body.title.trim() === "") {
      errors.push("title is required");
    } else {
      data.title = body.title.trim();
    }
  }

  if (body.description !== undefined) {
    if (body.description === null || body.description === "") {
      data.description = null;
    } else if (typeof body.description !== "string") {
      errors.push("description must be a string");
    } else {
      data.description = body.description;
    }
  }

  if (body.dueDate !== undefined) {
    if (body.dueDate === null || body.dueDate === "") {
      data.dueDate = null;
    } else {
      const d = new Date(body.dueDate);
      if (Number.isNaN(d.getTime())) {
        errors.push("dueDate must be a valid date");
      } else {
        data.dueDate = d;
      }
    }
  }

  if (body.priority !== undefined) {
    if (!PRIORITIES.includes(body.priority)) {
      errors.push(`priority must be one of ${PRIORITIES.join(", ")}`);
    } else {
      data.priority = body.priority;
    }
  }

  if (body.status !== undefined) {
    if (!STATUSES.includes(body.status)) {
      errors.push(`status must be one of ${STATUSES.join(", ")}`);
    } else {
      data.status = body.status;
    }
  }

  if (body.categoryId !== undefined) {
    if (body.categoryId === null || body.categoryId === "") {
      data.categoryId = null;
    } else {
      const cid = Number(body.categoryId);
      if (!Number.isInteger(cid) || cid <= 0) {
        errors.push("categoryId must be a positive integer or null");
      } else {
        data.categoryId = cid;
      }
    }
  }

  return { errors, data };
}

export function validateCategoryPayload(body) {
  const errors = [];
  const data = {};

  if (typeof body.name !== "string" || body.name.trim() === "") {
    errors.push("name is required");
  } else {
    data.name = body.name.trim();
  }

  if (body.color !== undefined && body.color !== null && body.color !== "") {
    if (typeof body.color !== "string" || !/^#[0-9a-fA-F]{6}$/.test(body.color)) {
      errors.push("color must be a hex code like #3B82F6");
    } else {
      data.color = body.color;
    }
  }

  return { errors, data };
}
