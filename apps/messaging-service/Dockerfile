# Contexto de build = raiz do repositório:
#   docker build -f apps/messaging-service/Dockerfile -t relaydesk/messaging:latest .
#
# Copia o monorepo completo para resolver workspaces `pnpm` de forma fiável.
# Para imagens mais pequenas, evoluir para `turbo prune` + `pnpm deploy --prod`.

FROM node:22-bookworm-slim AS build
WORKDIR /relaydesk
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@10.12.1 --activate
COPY . .
RUN pnpm install --frozen-lockfile \
  && pnpm db:generate \
  && pnpm --filter @relaydesk/messaging-service build

FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 relaydesk
COPY --from=build /relaydesk/apps/messaging-service/dist ./dist
COPY --from=build /relaydesk/apps/messaging-service/package.json ./
COPY --from=build /relaydesk/node_modules ./node_modules
COPY --from=build /relaydesk/packages ./packages
USER relaydesk
EXPOSE 4012
CMD ["node", "dist/main.js"]
