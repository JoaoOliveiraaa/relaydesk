"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupRelaydeskSwagger = setupRelaydeskSwagger;
const swagger_1 = require("@nestjs/swagger");
const openapi_schemas_1 = require("./openapi-schemas");
const RELAYDESK_SWAGGER_CSS = `
.swagger-ui .topbar { display: none }
.swagger-ui .info .title { font-size: 1.75rem; letter-spacing: -0.02em }
.swagger-ui .info .description { font-size: 15px; line-height: 1.6; max-width: 56rem }
.swagger-ui .scheme-container { background: #0b1220; padding: 12px; border-radius: 8px }
body { background: #070b12 }
.swagger-ui .wrapper { max-width: 1200px }
`.trim();
function setupRelaydeskSwagger(app, opts) {
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
    const config = new swagger_1.DocumentBuilder()
        .setTitle(opts.title)
        .setDescription(description)
        .setVersion(opts.version)
        .addBearerAuth({
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Access token JWT emitido pelo Auth Service.',
    }, 'access-token')
        .addApiKey({
        type: 'apiKey',
        name: 'X-RelayDesk-Internal-Token',
        in: 'header',
        description: 'Token machine-to-machine (só endpoints internos).',
    }, 'internal-token')
        .addApiKey({ type: 'apiKey', name: 'X-Correlation-Id', in: 'header', description: 'Correlação ponta-a-ponta (recomendado UUID).' }, 'correlation-id')
        .addApiKey({ type: 'apiKey', name: 'X-Request-Id', in: 'header', description: 'Id único do pedido HTTP.' }, 'request-id')
        .build();
    let document = swagger_1.SwaggerModule.createDocument(app, config, {
        operationIdFactory: (controllerKey, methodKey) => `${controllerKey.replace(/Controller$/, '')}_${methodKey}`,
    });
    document = (0, openapi_schemas_1.mergeRelaydeskOpenApiComponents)(document);
    document = opts.transformDocument ? opts.transformDocument(document) : document;
    swagger_1.SwaggerModule.setup(docsPath, app, document, {
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
//# sourceMappingURL=relaydesk-swagger.js.map