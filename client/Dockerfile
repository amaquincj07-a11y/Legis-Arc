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
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
RUN addgroup -S legisarc && adduser -S legisarc -G legisarc
COPY --from=build /app/public ./public
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
USER legisarc
EXPOSE 3000
CMD ["node", "server.js"]
