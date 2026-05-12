import type { INestApplication } from '@nestjs/common';
import { type OpenAPIObject } from '@nestjs/swagger';
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
export declare function setupRelaydeskSwagger(app: INestApplication, opts: RelaydeskSwaggerOptions): void;
//# sourceMappingURL=relaydesk-swagger.d.ts.map