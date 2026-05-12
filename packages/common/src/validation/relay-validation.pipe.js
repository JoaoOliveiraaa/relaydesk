"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRelayValidationPipe = createRelayValidationPipe;
const common_1 = require("@nestjs/common");
function createRelayValidationPipe() {
    return new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
    });
}
//# sourceMappingURL=relay-validation.pipe.js.map