# LegisArc Next.js app
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

FROM node:20-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# JWT_SECRET must be available at build for Edge middleware inlining
ARG JWT_SECRET=replace_at_build_time
ARG NEXT_PUBLIC_API_URL=http://localhost:4000
ENV JWT_SECRET=$JWT_SECRET
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_TELEMETRY_DISABLED=1
# Cap Node heap so the Droplet OOM-killer is less likely to thrash for hours.
# On 2 GB hosts, prefer host swap (see handbook LL-002) over raising this further.
ENV NODE_OPTIONS="--max-old-space-size=1536"
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV NEXT_TELEMETRY_DISABLED=1
# Do not inherit build-time NODE_OPTIONS into the slim runtime image.
ENV NODE_OPTIONS=
RUN addgroup -S legisarc && adduser -S legisarc -G legisarc
COPY --from=build /app/public ./public
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
USER legisarc
EXPOSE 3000
CMD ["node", "server.js"]
