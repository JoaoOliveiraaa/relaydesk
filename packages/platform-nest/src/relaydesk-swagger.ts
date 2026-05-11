import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule, type OpenAPIObject } from '@nestjs/swagger';
import { mergeRelaydeskOpenApiComponents } from './openapi-schemas';

const RELAYDESK_SWAGGER_CSS = `
.swagger-ui .topbar { display: none }
.swagger-ui .info .title { font-size: 1.75rem; letter-spacing: -0.02em }
.swagger-ui .info .description { font-size: 15px; line-height: 1.6; max-width: 56rem }
.swagger-ui .scheme-container { background: #0b1220; padding: 12px; border-radius: 8px }
body { background: #070b12 }
.swagger-ui .wrapper { max-width: 1200px }
`.trim();

export interface RelaydeskSwaggerOptions {
  serviceName: string;
  title: string;
  description: string;
  /** Versão documentada (ex.: 1.0.0). */
  version: string;
  /** Caminho UI (default docs). */
  docsPath?: string;
  /** Domínios / tags sugeridas na descrição (Markdown). */
  extraDescription?: string;
  /** Pós-processamento do documento OpenAPI. */
  transformDocument?: (doc: OpenAPIObject) => OpenAPIObject;
}

export function setupRelaydeskSwagger(app: INestApplication, opts: RelaydeskSwaggerOptions): void {
  const docsPath = opts.docsPath ?? 'docs';
  const description = [
    opts.description,
    '',
    '### Convenções',
    '- **Envelope**: respostas JSON usam `success`, `data`, `meta` (ver schemas `RelayDesk*Envelope`).',
    '- **Erros**: `success: false` com `error.code` estável e `meta.correlationId` para suporte.',
    '- **Tracing**: envie `X-Correlation-Id` (e opcionalmente `traceparent` W3C) em todos os pedidos.',
    '',
    opts.extraDescription ?? '',
  ]
    .filter(Boolean)
    .join('\n');

  const config = new DocumentBuilder()
    .setTitle(opts.title)
    .setDescription(description)
    .setVersion(opts.version)
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Access token JWT emitido pelo Auth Service.',
      },
      'access-token',
    )
    .addApiKey(
      {
        type: 'apiKey',
        name: 'X-RelayDesk-Internal-Token',
        in: 'header',
        description: 'Token machine-to-machine (só endpoints internos).',
      },
      'internal-token',
    )
    .addApiKey(
      { type: 'apiKey', name: 'X-Correlation-Id', in: 'header', description: 'Correlação ponta-a-ponta (recomendado UUID).' },
      'correlation-id',
    )
    .addApiKey(
      { type: 'apiKey', name: 'X-Request-Id', in: 'header', description: 'Id único do pedido HTTP.' },
      'request-id',
    )
    .build();

  let document = SwaggerModule.createDocument(app, config, {
    operationIdFactory: (controllerKey: string, methodKey: string) =>
      `${controllerKey.replace(/Controller$/, '')}_${methodKey}`,
  });
  document = mergeRelaydeskOpenApiComponents(document);
  document = opts.transformDocument ? opts.transformDocument(document) : document;

  SwaggerModule.setup(docsPath, app, document, {
    customSiteTitle: `${opts.serviceName} · RelayDesk`,
    customCss: RELAYDESK_SWAGGER_CSS,
    jsonDocumentUrl: '/openapi.json',
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'list',
      filter: true,
      displayRequestDuration: true,
      tryItOutEnabled: true,
    },
  });
}
