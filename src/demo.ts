import { AutoSearch, shouldSearch, createAutoSearch } from "./index.js";

const demo = async () => {
    console.log("=== auto-search demo ===\n");

    // simple one-liner
    console.log("--- simple api ---");
    console.log("'weather today':", await shouldSearch("weather today", { useModel: false }));
    console.log("'write python code':", await shouldSearch("write python code", { useModel: false }));
  
    console.log("\n--- full api ---");
    const searcher = createAutoSearch({ useModel: false });
  
    const queries = [
        "what is the current bitcoin price",
        "write a typescript function",
        "hello how are you",
        "latest news about AI",
        "explain quantum computing",
        "solve 2x + 5 = 15",
        "who won the game yesterday",
        "write me a poem",
    ];

    for (const query of queries) {
        const decision = await searcher.decide(query);
        const icon = decision.shouldSearch ? "🔍" : "💭";
        console.log(`${icon} "${query}"`);
        console.log(`   search: ${decision.shouldSearch}, confidence: ${decision.confidence.toFixed(2)}, category: ${decision.category}`);
    }

    console.log("\n--- analysis ---");
    const analysis = searcher.analyze("current stock prices today");
    console.log("query:", analysis.query);
    console.log("temporal:", analysis.hasTemporalIndicator);
    console.log("current event:", analysis.hasCurrentEventIndicator);
    console.log("realtime needed:", analysis.requiresRealtimeData);
};

demo().catch(console.error);
