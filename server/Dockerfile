FROM node:22-alpine

WORKDIR /app

COPY index.mjs ./

ENV PORT=8787
EXPOSE 8787

HEALTHCHECK --interval=2s --timeout=3s --start-period=5s --retries=15 \
  CMD node -e "fetch('http://127.0.0.1:8787/api/health').then((r)=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "index.mjs"]
