# auto-search

intelligent auto-search decision system for ai models. decides whether a query needs web search or if the model can answer from training data.

## why

tired of manually toggling search for every query? this system automatically decides if search is needed based on the query content, saving api calls and reducing latency.

## features

- **smart heuristics**: fast pattern matching for common query types
- **model fallback**: uses ollama for ambiguous cases
- **hybrid mode**: combines heuristics with model intelligence
- **http api**: rest endpoints for microservice architecture
- **effect-ts**: proper error handling and composition
- **fully typed**: strict typescript throughout
- **modular**: use individual components or the full system
- **scalable**: designed for high-throughput applications

## install

```bash
npm install
```

## config

copy `.env.example` to `.env` and configure:

```
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=qwen2.5vl:3b
SEARCH_CONFIDENCE_THRESHOLD=0.7
MAX_RETRIES=3
REQUEST_TIMEOUT_MS=30000
```

## usage

### simple

```typescript
import { shouldSearch } from "auto-search";

const needsSearch = await shouldSearch("current bitcoin price");
// true

const needsSearch2 = await shouldSearch("write a python function");
// false
```

### full api

```typescript
import { createAutoSearch } from "auto-search";

const searcher = createAutoSearch({
  useModel: true, // use ollama for ambiguous cases
  config: {
    confidenceThreshold: 0.7,
  },
});

const decision = await searcher.decide("latest tech news");
// {
//   shouldSearch: true,
//   confidence: 0.85,
//   reasoning: "heuristic signals: current_event, temporal, realtime",
//   category: "factual_current"
// }
```

### heuristics only (fast, no model)

```typescript
const searcher = createAutoSearch({ useModel: false });
const decision = await searcher.decide("write code");
// no ollama call, instant response
```

### analysis

```typescript
const analysis = searcher.analyze("what is happening today");
// {
//   query: "what is happening today",
//   hasTemporalIndicator: true,
//   hasCurrentEventIndicator: true,
//   requiresRealtimeData: true,
//   ...
// }
```

### effect-based (for composition)

```typescript
import { decideHybrid, runDecision } from "auto-search";
import { Effect, pipe } from "effect";

const program = pipe(
  decideHybrid(config, "latest news"),
  Effect.map((d) => d.shouldSearch),
  Effect.catchAll(() => Effect.succeed(false))
);

const result = await Effect.runPromise(program);
```

## http api

start the server:

```bash
npm run serve
# or with custom port
PORT=8080 npm run serve
```

### endpoints

#### `GET /`
returns api info and available endpoints.

#### `GET /health`
health check endpoint.

```bash
curl http://localhost:3000/health
# {"status":"ok","timestamp":1234567890}
```

#### `POST /decide`
decide if a single query needs search.

```bash
curl -X POST http://localhost:3000/decide \
  -H "Content-Type: application/json" \
  -d '{"query": "current bitcoin price"}'
```

response:
```json
{
  "success": true,
  "data": {
    "shouldSearch": true,
    "confidence": 1,
    "reasoning": "heuristic signals: temporal, current_event, realtime, factual",
    "category": "factual_current"
  }
}
```

#### `POST /batch`
process multiple queries at once (max 100).

```bash
curl -X POST http://localhost:3000/batch \
  -H "Content-Type: application/json" \
  -d '{"queries": ["latest news", "write code", "hello"]}'
```

#### `POST /analyze`
get detailed query analysis without decision.

```bash
curl -X POST http://localhost:3000/analyze \
  -H "Content-Type: application/json" \
  -d '{"query": "what is the weather today"}'
```

## query categories

| category | search? | examples |
|----------|---------|----------|
| `factual_current` | ✅ | news, stock prices, weather, sports scores |
| `factual_static` | ❌ | definitions, history, science facts |
| `code` | ❌ | programming, debugging, refactoring |
| `math` | ❌ | calculations, equations, formulas |
| `creative` | ❌ | stories, poems, songs |
| `opinion` | ❌ | recommendations, preferences |
| `personal` | ❌ | questions about the ai itself |
| `ambiguous` | 🤷 | unclear intent, uses model if enabled |

## architecture

```
src/
├── index.ts          # main exports, AutoSearch class
├── server.ts         # standalone api server entry
├── types/            # typescript interfaces and zod schemas
├── config/           # environment and configuration
├── core/             # heuristics, patterns, analyzer
├── providers/        # ollama integration
├── effects/          # effect-ts based decision logic
└── api/              # http api server and handlers
```

## testing

```bash
npm test
```

## build

```bash
npm run build
```

## license

mit
