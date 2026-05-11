import type { OpenAPIObject } from '@nestjs/swagger';

/** Componentes OpenAPI reutilizáveis (RelayDesk API Governance). */
export function mergeRelaydeskOpenApiComponents(doc: OpenAPIObject): OpenAPIObject {
  doc.components = doc.components ?? {};
  doc.components.schemas = {
    ...doc.components.schemas,
    RelayDeskApiMeta: {
      type: 'object',
      required: ['apiVersion'],
      properties: {
        apiVersion: { type: 'string', example: '2024-06-01' },
        requestId: { type: 'string', format: 'uuid' },
        correlationId: { type: 'string', format: 'uuid' },
      },
    },
    RelayDeskErrorBody: {
      type: 'object',
      required: ['code', 'message'],
      properties: {
        code: { type: 'string', example: 'HTTP_400' },
        message: { type: 'string' },
        details: { type: 'object', additionalProperties: true },
      },
    },
    RelayDeskErrorEnvelope: {
      type: 'object',
      required: ['success', 'error', 'meta'],
      properties: {
        success: { type: 'boolean', enum: [false] },
        error: { $ref: '#/components/schemas/RelayDeskErrorBody' },
        meta: { $ref: '#/components/schemas/RelayDeskApiMeta' },
      },
    },
    RelayDeskSuccessEnvelope: {
      type: 'object',
      required: ['success', 'data', 'meta'],
      properties: {
        success: { type: 'boolean', enum: [true] },
        data: {},
        meta: { $ref: '#/components/schemas/RelayDeskApiMeta' },
      },
    },
    RelayDeskPageMeta: {
      type: 'object',
      properties: {
        page: { type: 'integer', minimum: 1 },
        pageSize: { type: 'integer', minimum: 1, maximum: 200 },
        total: { type: 'integer', minimum: 0 },
        hasNext: { type: 'boolean' },
      },
    },
  };
  return doc;
}
