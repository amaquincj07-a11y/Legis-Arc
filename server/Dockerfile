# LegisArc Express API
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

FROM node:20-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup -S legisarc && adduser -S legisarc -G legisarc
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./package.json
COPY db ./db
RUN mkdir -p uploads && chown -R legisarc:legisarc /app
USER legisarc
EXPOSE 4000
CMD ["node", "dist/index.js"]
