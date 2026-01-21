import { describe, it, expect } from "vitest";
import { patterns, matchesAny, containsTemporal } from "../src/core/patterns.js";

describe("patterns", () => {
    describe("matchesAny", () => {
        it("returns true when any pattern matches", () => {
            expect(matchesAny("what is the news", patterns.currentEvent)).toBe(true);
        });

        it("returns false when no pattern matches", () => {
            expect(matchesAny("hello world", patterns.currentEvent)).toBe(false);
        });

        it("is case insensitive", () => {
            expect(matchesAny("WRITE CODE", patterns.code)).toBe(true);
        });
    });

    describe("containsTemporal", () => {
        it("detects today", () => {
            expect(containsTemporal("what happened today")).toBe(true);
        });

        it("detects current", () => {
            expect(containsTemporal("current president")).toBe(true);
        });

        it("detects years", () => {
            expect(containsTemporal("events of 2025")).toBe(true);
        });

        it("returns false for static text", () => {
            expect(containsTemporal("what is water")).toBe(false);
        });
    });

    describe("currentEvent patterns", () => {
        const testCases = [
            ["breaking news about tech", true],
            ["stock prices", true],
            ["weather forecast", true],
            ["game score", true],
            ["election results", true],
            ["who is the current president", true],
            ["what is happening now", true],
            ["recipe for cake", false],
        ] as const;

        testCases.forEach(([input, expected]) => {
            it(`"${input}" -> ${expected}`, () => {
                expect(matchesAny(input, patterns.currentEvent)).toBe(expected);
            });
        });
    });

    describe("staticKnowledge patterns", () => {
        const testCases = [
            ["what is photosynthesis", true],
            ["define entropy", true],
            ["explain how gravity works", true],
            ["history of rome", true],
            ["who invented the internet", true],
            ["capital of japan", true],
            ["pythagorean theorem", true],
            ["write me a story", false],
        ] as const;

        testCases.forEach(([input, expected]) => {
            it(`"${input}" -> ${expected}`, () => {
                expect(matchesAny(input, patterns.staticKnowledge)).toBe(expected);
            });
        });
    });

    describe("code patterns", () => {
        const testCases = [
            ["write a function", true],
            ["debug this error", true],
            ["javascript array methods", true],
            ["implement a class", true],
            ["refactor the code", true],
            ["api endpoint design", true],
            ["make me a sandwich", false],
        ] as const;

        testCases.forEach(([input, expected]) => {
            it(`"${input}" -> ${expected}`, () => {
                expect(matchesAny(input, patterns.code)).toBe(expected);
            });
        });
    });

    describe("math patterns", () => {
        const testCases = [
            ["calculate 5 + 3", true],
            ["solve the equation", true],
            ["derivative of x^2", true],
            ["statistics problem", true],
            ["simplify this expression", true],
            ["15 * 20", true],
            ["what color is the sky", false],
        ] as const;

        testCases.forEach(([input, expected]) => {
            it(`"${input}" -> ${expected}`, () => {
                expect(matchesAny(input, patterns.math)).toBe(expected);
            });
        });
    });

    describe("creative patterns", () => {
        const testCases = [
            ["write a story", true],
            ["create a poem", true],
            ["generate a song", true],
            ["compose lyrics", true],
            ["imagine a world", true],
            ["act as a pirate", true],
            ["what is 2+2", false],
        ] as const;

        testCases.forEach(([input, expected]) => {
            it(`"${input}" -> ${expected}`, () => {
                expect(matchesAny(input, patterns.creative)).toBe(expected);
            });
        });
    });

    describe("noSearchNeeded patterns", () => {
        const testCases = [
            ["hello", true],
            ["hi there", true],
            ["good morning", true],
            ["thank you", true],
            ["thanks", true],
            ["help me understand this", true],
            ["what can you do", true],
            ["explain to me how", true],
            ["bitcoin price", false],
        ] as const;

        testCases.forEach(([input, expected]) => {
            it(`"${input}" -> ${expected}`, () => {
                expect(matchesAny(input, patterns.noSearchNeeded)).toBe(expected);
            });
        });
    });
});
