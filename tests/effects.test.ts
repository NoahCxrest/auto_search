import { describe, it, expect, vi } from "vitest";
import { Effect } from "effect";
import { decideWithHeuristics, runDecision } from "../src/effects/decision.js";
import { createConfig } from "../src/config/index.js";

describe("effects/decision", () => {
    const config = createConfig({ confidenceThreshold: 0.7 });

    describe("decideWithHeuristics", () => {
        it("returns effect that resolves to decision", async () => {
            const effect = decideWithHeuristics(config, "what is the weather today");
            const decision = await runDecision(effect);
      
            expect(decision.shouldSearch).toBe(true);
            expect(decision.confidence).toBeGreaterThanOrEqual(0);
            expect(decision.confidence).toBeLessThanOrEqual(1);
            expect(decision.reasoning).toBeDefined();
            expect(decision.category).toBeDefined();
        });

        it("never fails for heuristic decisions", async () => {
            const queries = [
                "hello",
                "write code",
                "current news",
                "",
                "!@#$%",
            ];

            for (const query of queries) {
                const effect = decideWithHeuristics(config, query);
                const decision = await runDecision(effect);
                expect(decision).toBeDefined();
            }
        });
    });

    describe("effect composition", () => {
        it("can be mapped", async () => {
            const effect = decideWithHeuristics(config, "hello").pipe(
                Effect.map((d) => d.shouldSearch)
            );
            const result = await Effect.runPromise(effect);
            expect(typeof result).toBe("boolean");
        });

        it("can be chained", async () => {
            const effect = decideWithHeuristics(config, "hello").pipe(
                Effect.flatMap((d) => 
                    Effect.succeed({ 
                        search: d.shouldSearch, 
                        cat: d.category 
                    })
                )
            );
            const result = await Effect.runPromise(effect);
            expect(result).toHaveProperty("search");
            expect(result).toHaveProperty("cat");
        });
    });
});
