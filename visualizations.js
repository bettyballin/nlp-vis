/**
 * NLP Pipeline Visualizations
 * 
 * This file contains D3.js-based visualizations for the NLP pipeline,
 * including tokenization, embeddings, attention patterns, preprocessing,
 * embedding space comparison, and token prediction.
 */

/**
 * Tokenization Visualization
 * Visualizes the tokenization of text
 */
class TokenizationViz {
    constructor(containerId) {
        this.container = d3.select(`#${containerId}`);
        this.init();
    }
    
    init() {
        // Clear previous content
        this.container.html("");
        
        // Create container for tokens
        this.tokensContainer = this.container.append("div")
            .attr("class", "tokens-container");
            
        // Create container for token details
        this.detailsContainer = this.container.append("div")
            .attr("class", "token-details-container")
            .style("margin-top", "20px")
            .style("padding", "10px")
            .style("border-top", "1px solid #dadce0");
    }
    
    update(tokenizationResults) {
        // Ensure we have valid tokenization results
        if (!tokenizationResults || !tokenizationResults.tokens) {
            console.error("Invalid tokenization results:", tokenizationResults);
            return;
        }
        
        const { tokens, tokenDetails } = tokenizationResults;
        console.log("TokenizationViz.update - tokens:", tokens);
        console.log("TokenizationViz.update - tokenDetails:", tokenDetails);
        
        // Clear previous tokens
        this.tokensContainer.html("");
        
        // Display tokens
        if (Array.isArray(tokens)) {
            console.log("Displaying", tokens.length, "tokens");
            tokens.forEach((token, i) => {
                console.log("Creating token element for:", token);
                const tokenElement = this.tokensContainer.append("div")
                    .attr("class", "token")
                    .text(token)
                    .style("cursor", "pointer")
                    .on("mouseover", () => {
                        // Highlight token
                        tokenElement.style("background-color", "#1a73e8");
                        
                        // Show token details
                        this.showTokenDetails(token, tokenDetails ? tokenDetails[i] : null);
                    })
                    .on("mouseout", () => {
                        // Reset token color
                        tokenElement.style("background-color", "");
                        
                        // Clear details
                        this.detailsContainer.html("");
                    });
                    
                // Color based on token type if available
                if (tokenDetails && tokenDetails[i]) {
                    const detail = tokenDetails[i];
                    
                    if (detail.type === "subword") {
                        if (detail.position === "prefix") {
                            tokenElement.style("background-color", "#4285f4");
                        } else {
                            tokenElement.style("background-color", "#34a853");
                        }
                    } else if (detail.type === "character") {
                        tokenElement.style("background-color", "#ea4335");
                    }
                }
            });
        } else {
            console.error("Tokens is not an array:", tokens);
        }
    }
    
    showTokenDetails(token, details) {
        // Clear previous details
        this.detailsContainer.html("");
        
        // Add token heading
        this.detailsContainer.append("h4")
            .text(`Token: "${token}"`)
            .style("margin-bottom", "10px");
            
        // Add token details if available
        if (details) {
            const detailsList = this.detailsContainer.append("ul")
                .style("list-style", "none")
                .style("padding", "0");
                
            detailsList.append("li")
                .text(`Type: ${details.type}`);
                
            if (details.position) {
                detailsList.append("li")
                    .text(`Position: ${details.position}`);
            }
        }
    }
}

/**
 * Embedding Visualization
 * Visualizes token embeddings
 */
class EmbeddingViz {
    constructor(containerId) {
        this.container = d3.select(`#${containerId}`);
        const rect = this.container.node().getBoundingClientRect();
        this.width = Math.max(300, rect.width || 300);
        this.height = Math.max(300, rect.height || 300);
        this.margin = { top: 20, right: 20, bottom: 50, left: 50 };
        this.init();
    }
    
    init() {
        // Clear previous content
        this.container.html("");
        
        // Create SVG
        this.svg = this.container.append("svg")
            .attr("width", this.width)
            .attr("height", this.height);
            
        // Create scales for 2D projection
        this.xScale = d3.scaleLinear()
            .domain([-1, 1])
            .range([this.margin.left, this.width - this.margin.right]);
            
        this.yScale = d3.scaleLinear()
            .domain([-1, 1])
            .range([this.height - this.margin.bottom, this.margin.top]);
            
        // Add axes
        this.svg.append("g")
            .attr("transform", `translate(0,${this.height - this.margin.bottom})`)
            .call(d3.axisBottom(this.xScale));
            
        this.svg.append("g")
            .attr("transform", `translate(${this.margin.left},0)`)
            .call(d3.axisLeft(this.yScale));
            
        // Add axis labels
        this.svg.append("text")
            .attr("x", this.width / 2)
            .attr("y", this.height - 10)
            .attr("text-anchor", "middle")
            .text("Dimension 1 (PCA)");
            
        this.svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("x", -this.height / 2)
            .attr("y", 15)
            .attr("text-anchor", "middle")
            .text("Dimension 2 (PCA)");
            
        // Create group for embedding points
        this.pointsGroup = this.svg.append("g");
        
        // We'll create tooltips on demand instead of reusing a single tooltip
        // to avoid circular references
    }
    
    update(embeddingResults) {
        // Ensure we have valid embedding results
        if (!embeddingResults || !embeddingResults.embeddingDetails) {
            console.error("Invalid embedding results:", embeddingResults);
            return;
        }
        
        const { embeddingDetails } = embeddingResults;
        
        // Project embeddings to 2D using PCA (simplified)
        const projectedEmbeddings = this.projectEmbeddings(embeddingDetails);
        
        // Update domain based on projected data
        const xExtent = d3.extent(projectedEmbeddings, d => d.x);
        const yExtent = d3.extent(projectedEmbeddings, d => d.y);
        
        this.xScale.domain([xExtent[0] - 0.1, xExtent[1] + 0.1]);
        this.yScale.domain([yExtent[0] - 0.1, yExtent[1] + 0.1]);
        
        // Update axes
        this.svg.select("g").call(d3.axisBottom(this.xScale));
        this.svg.selectAll("g").filter((d, i) => i === 1).call(d3.axisLeft(this.yScale));
        
        // Clear previous points
        this.pointsGroup.selectAll("*").remove();
        
        // Add embedding points
        this.pointsGroup.selectAll("circle")
            .data(projectedEmbeddings)
            .enter()
            .append("circle")
            .attr("cx", d => this.xScale(d.x))
            .attr("cy", d => this.yScale(d.y))
            .attr("r", 5)
            .attr("fill", d => {
                // Color based on embedding type
                switch (d.type) {
                    case "random": return "#4285f4";
                    case "word2vec": return "#34a853";
                    case "glove": return "#ea4335";
                    case "contextual": return "#fbbc05";
                    default: return "#4285f4";
                }
            })
            .attr("stroke", "white")
            .attr("stroke-width", 1)
            .on("mouseover", (event, d) => {
                // Remove any existing tooltips
                d3.selectAll(".embedding-viz-tooltip").remove();
                
                // Create a new tooltip
                const tooltip = d3.select("body").append("div")
                    .attr("class", "tooltip embedding-viz-tooltip")
                    .style("position", "absolute")
                    .style("background-color", "white")
                    .style("border", "1px solid #dadce0")
                    .style("border-radius", "4px")
                    .style("padding", "5px")
                    .style("pointer-events", "none")
                    .style("opacity", 0);
                
                tooltip.transition()
                    .duration(200)
                    .style("opacity", 0.9);
                    
                tooltip.html(`Token: ${d.token}<br>Type: ${d.type}`)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", () => {
                // Remove tooltip
                d3.selectAll(".embedding-viz-tooltip").remove();
            });
            
        // Add token labels
        this.pointsGroup.selectAll("text")
            .data(projectedEmbeddings)
            .enter()
            .append("text")
            .attr("x", d => this.xScale(d.x))
            .attr("y", d => this.yScale(d.y) - 10)
            .attr("text-anchor", "middle")
            .attr("font-size", "10px")
            .text(d => d.token);
    }
    
    projectEmbeddings(embeddingDetails) {
        // Simplified PCA projection to 2D
        // In reality, we would use a proper PCA algorithm
        
        const projectedEmbeddings = [];
        
        for (const detail of embeddingDetails) {
            const embedding = detail.embedding;
            
            // Use first two dimensions as a simple projection
            // In a real implementation, we would compute principal components
            let x = 0;
            let y = 0;
            
            if (embedding.length >= 2) {
                // Use first two dimensions with some mixing
                x = embedding[0];
                y = embedding[1];
                
                // Add some influence from other dimensions
                for (let i = 2; i < Math.min(10, embedding.length); i++) {
                    x += embedding[i] * 0.05 * Math.cos(i);
                    y += embedding[i] * 0.05 * Math.sin(i);
                }
            }
            
            projectedEmbeddings.push({
                token: detail.token,
                type: detail.type,
                x,
                y,
                originalEmbedding: embedding
            });
        }
        
        return projectedEmbeddings;
    }
    
    resize() {
        const rect = this.container.node().getBoundingClientRect();
        this.width = Math.max(300, rect.width || 300);
        this.height = Math.max(300, rect.height || 300);
        
        this.svg.attr("width", this.width).attr("height", this.height);
        
        this.xScale.range([this.margin.left, this.width - this.margin.right]);
        this.yScale.range([this.height - this.margin.bottom, this.margin.top]);
        
        // Update axes
        this.svg.select("g").call(d3.axisBottom(this.xScale));
        this.svg.selectAll("g").filter((d, i) => i === 1).call(d3.axisLeft(this.yScale));
    }
}

/**
 * Attention Pattern Visualization
 * Visualizes attention patterns between tokens
 */
class AttentionViz {
    constructor(containerId) {
        this.container = d3.select(`#${containerId}`);
        const rect = this.container.node().getBoundingClientRect();
        this.width = Math.max(300, rect.width || 300);
        this.height = Math.max(300, rect.height || 300);
        this.margin = { top: 50, right: 20, bottom: 50, left: 50 };
        this.init();
    }
    
    init() {
        // Clear previous content
        this.container.html("");
        
        // Create controls for attention head selection
        this.controls = this.container.append("div")
            .attr("class", "attention-controls")
            .style("margin-bottom", "10px");
            
        this.controls.append("label")
            .attr("for", "attention-head-select")
            .text("Attention Head: ")
            .style("margin-right", "10px");
            
        this.headSelect = this.controls.append("select")
            .attr("id", "attention-head-select")
            .on("change", () => {
                const selectedHead = parseInt(this.headSelect.property("value"));
                this.updateAttentionMatrix(this.currentAttentionData, selectedHead);
            });
            
        // Create SVG
        this.svg = this.container.append("svg")
            .attr("width", this.width)
            .attr("height", this.height - 40); // Adjust for controls
            
        // Create group for attention matrix
        this.matrixGroup = this.svg.append("g")
            .attr("transform", `translate(${this.margin.left}, ${this.margin.top})`);
            
        // Create groups for token labels
        this.sourceTokensGroup = this.svg.append("g");
        this.targetTokensGroup = this.svg.append("g");
        
        // Create color scale for attention scores
        this.colorScale = d3.scaleSequential(d3.interpolateBlues)
            .domain([0, 1]);
    }
    
    update(attentionResults, tokens) {
        // Ensure we have valid attention results and tokens
        if (!attentionResults || !attentionResults.attentionMatrices || !tokens) {
            console.error("Invalid attention results or tokens:", attentionResults, tokens);
            return;
        }
        
        const { attentionMatrices, numHeads } = attentionResults;
        this.currentAttentionData = { attentionMatrices, tokens };
        
        // Update head selection dropdown
        this.headSelect.html("");
        
        for (let i = 0; i < numHeads; i++) {
            this.headSelect.append("option")
                .attr("value", i)
                .text(`Head ${i + 1}`);
        }
        
        // Display first head by default
        this.updateAttentionMatrix({ attentionMatrices, tokens }, 0);
    }
    
    updateAttentionMatrix(data, headIndex) {
        const { attentionMatrices, tokens } = data;
        const attentionMatrix = attentionMatrices[headIndex].matrix;
        
        // Clear previous matrix
        this.matrixGroup.html("");
        this.sourceTokensGroup.html("");
        this.targetTokensGroup.html("");
        
        // Calculate cell size based on number of tokens
        const numTokens = tokens.length;
        const availableWidth = this.width - this.margin.left - this.margin.right;
        const availableHeight = this.height - this.margin.top - this.margin.bottom - 40; // Adjust for controls
        const cellSize = Math.max(5, Math.min(availableWidth, availableHeight) / Math.max(1, numTokens));
        
        // Draw attention matrix
        for (let i = 0; i < numTokens; i++) {
            for (let j = 0; j < numTokens; j++) {
                const score = attentionMatrix[i][j];
                
                this.matrixGroup.append("rect")
                    .attr("x", j * cellSize)
                    .attr("y", i * cellSize)
                    .attr("width", Math.max(1, cellSize))
                    .attr("height", Math.max(1, cellSize))
                    .attr("fill", this.colorScale(score))
                    .attr("stroke", "white")
                    .attr("stroke-width", 0.5)
                    .on("mouseover", (event) => {
                        // Remove any existing tooltips
                        d3.selectAll(".attention-tooltip").remove();
                        
                        // Show tooltip with attention score
                        const tooltip = d3.select("body").append("div")
                            .attr("class", "tooltip attention-tooltip")
                            .style("position", "absolute")
                            .style("background-color", "white")
                            .style("border", "1px solid #dadce0")
                            .style("border-radius", "4px")
                            .style("padding", "5px")
                            .style("pointer-events", "none")
                            .style("opacity", 0);
                            
                        tooltip.transition()
                            .duration(200)
                            .style("opacity", 0.9);
                            
                        tooltip.html(`From: "${tokens[i]}"<br>To: "${tokens[j]}"<br>Score: ${score.toFixed(4)}`)
                            .style("left", (event.pageX + 10) + "px")
                            .style("top", (event.pageY - 28) + "px");
                            
                        // Highlight row and column
                        this.matrixGroup.selectAll("rect")
                            .filter((d, index) => {
                                const row = Math.floor(index / numTokens);
                                const col = index % numTokens;
                                return row === i || col === j;
                            })
                            .attr("stroke", "#4285f4")
                            .attr("stroke-width", 2);
                    })
                    .on("mouseout", () => {
                        // Remove tooltip
                        d3.selectAll(".attention-tooltip").remove();
                        
                        // Reset highlighting
                        this.matrixGroup.selectAll("rect")
                            .attr("stroke", "white")
                            .attr("stroke-width", 0.5);
                    });
            }
        }
        
        // Add source token labels (rows)
        for (let i = 0; i < numTokens; i++) {
            this.sourceTokensGroup.append("text")
                .attr("x", this.margin.left - 5)
                .attr("y", this.margin.top + i * cellSize + cellSize / 2)
                .attr("text-anchor", "end")
                .attr("dominant-baseline", "middle")
                .attr("font-size", "10px")
                .text(tokens[i]);
        }
        
        // Add target token labels (columns)
        for (let j = 0; j < numTokens; j++) {
            this.targetTokensGroup.append("text")
                .attr("x", this.margin.left + j * cellSize + cellSize / 2)
                .attr("y", this.margin.top - 5)
                .attr("text-anchor", "middle")
                .attr("dominant-baseline", "end")
                .attr("font-size", "10px")
                .attr("transform", `rotate(-45, ${this.margin.left + j * cellSize + cellSize / 2}, ${this.margin.top - 5})`)
                .text(tokens[j]);
        }
        
        // Add title
        this.svg.append("text")
            .attr("x", this.width / 2)
            .attr("y", 20)
            .attr("text-anchor", "middle")
            .attr("font-size", "14px")
            .attr("font-weight", "bold")
            .text(`Attention Matrix - Head ${headIndex + 1}`);
            
        // Add legend
        const legendWidth = 200;
        const legendHeight = 20;
        const legendX = this.width - legendWidth - this.margin.right;
        const legendY = 20;
        
        const legendScale = d3.scaleLinear()
            .domain([0, 1])
            .range([0, legendWidth]);
            
        const legendAxis = d3.axisBottom(legendScale)
            .ticks(5)
            .tickFormat(d3.format(".1f"));
            
        const defs = this.svg.append("defs");
        
        const gradient = defs.append("linearGradient")
            .attr("id", "attention-gradient")
            .attr("x1", "0%")
            .attr("y1", "0%")
            .attr("x2", "100%")
            .attr("y2", "0%");
            
        gradient.append("stop")
            .attr("offset", "0%")
            .attr("stop-color", this.colorScale(0));
            
        gradient.append("stop")
            .attr("offset", "100%")
            .attr("stop-color", this.colorScale(1));
            
        this.svg.append("rect")
            .attr("x", legendX)
            .attr("y", legendY)
            .attr("width", legendWidth)
            .attr("height", legendHeight)
            .style("fill", "url(#attention-gradient)");
            
        this.svg.append("g")
            .attr("transform", `translate(${legendX}, ${legendY + legendHeight})`)
            .call(legendAxis);
            
        this.svg.append("text")
            .attr("x", legendX + legendWidth / 2)
            .attr("y", legendY - 5)
            .attr("text-anchor", "middle")
            .attr("font-size", "10px")
            .text("Attention Score");
    }
    
    resize() {
        const rect = this.container.node().getBoundingClientRect();
        this.width = Math.max(300, rect.width || 300);
        this.height = Math.max(300, rect.height || 300);
        
        this.svg.attr("width", this.width).attr("height", this.height - 40);
        
        // Re-render current attention matrix
        if (this.currentAttentionData) {
            const selectedHead = parseInt(this.headSelect.property("value"));
            this.updateAttentionMatrix(this.currentAttentionData, selectedHead);
        }
    }
}

/**
 * Preprocessing Visualization
 * Visualizes the effects of different preprocessing steps
 */
class PreprocessingViz {
    constructor(containerId) {
        this.container = d3.select(`#${containerId}`);
        this.init();
    }
    
    init() {
        // Clear previous content
        this.container.html("");
        
        // Create container for preprocessing steps
        this.stepsContainer = this.container.append("div")
            .attr("class", "preprocessing-steps-container");
    }
    
    update(preprocessingResults) {
        // Ensure we have valid preprocessing results
        if (!preprocessingResults || !preprocessingResults.steps) {
            console.error("Invalid preprocessing results:", preprocessingResults);
            return;
        }
        
        const { steps } = preprocessingResults;
        
        // Clear previous steps
        this.stepsContainer.html("");
        
        // Display each preprocessing step
        steps.forEach((step, i) => {
            const stepContainer = this.stepsContainer.append("div")
                .attr("class", "preprocessing-step")
                .style("margin-bottom", "15px")
                .style("padding", "10px")
                .style("border", "1px solid #dadce0")
                .style("border-radius", "4px")
                .style("background-color", i === 0 ? "#f8f9fa" : "white");
                
            stepContainer.append("div")
                .attr("class", "preprocessing-step-title")
                .style("font-weight", "bold")
                .style("margin-bottom", "5px")
                .text(step.name === "original" ? "Original Text" : `After ${step.name}`);
                
            stepContainer.append("div")
                .attr("class", "preprocessing-step-text")
                .style("font-family", "monospace")
                .style("white-space", "pre-wrap")
                .style("padding", "10px")
                .style("background-color", "#f8f9fa")
                .style("border-radius", "4px")
                .text(step.text);
                
            // Add arrow to indicate flow, except for the last step
            if (i < steps.length - 1) {
                this.stepsContainer.append("div")
                    .style("text-align", "center")
                    .style("margin", "10px 0")
                    .html("↓");
            }
        });
        
        // Add summary
        this.stepsContainer.append("div")
            .style("margin-top", "20px")
            .style("padding", "10px")
            .style("background-color", "#e8f0fe")
            .style("border-radius", "4px")
            .html(`<strong>Summary:</strong> Applied ${steps.length - 1} preprocessing steps to transform the text.`);
    }
}

/**
 * Embedding Space Comparison Visualization
 * Compares different embedding spaces
 */
class EmbeddingSpaceViz {
    constructor(containerId) {
        this.container = d3.select(`#${containerId}`);
        const rect = this.container.node().getBoundingClientRect();
        this.width = Math.max(300, rect.width || 300);
        this.height = Math.max(300, rect.height || 300);
        this.margin = { top: 20, right: 20, bottom: 50, left: 50 };
        this.init();
    }
    
    init() {
        // Clear previous content
        this.container.html("");
        
        // Create controls for embedding type selection
        this.controls = this.container.append("div")
            .attr("class", "embedding-controls")
            .style("margin-bottom", "10px");
            
        this.controls.append("label")
            .attr("for", "embedding-type-select")
            .text("Embedding Type: ")
            .style("margin-right", "10px");
            
        this.embeddingSelect = this.controls.append("select")
            .attr("id", "embedding-type-select")
            .on("change", () => {
                const selectedType = this.embeddingSelect.property("value");
                this.updateEmbeddingSpace(this.currentEmbeddingData, selectedType);
            });
            
        // Add embedding type options
        const embeddingTypes = ["word2vec", "glove", "contextual"];
        
        embeddingTypes.forEach(type => {
            this.embeddingSelect.append("option")
                .attr("value", type)
                .text(type === "word2vec" ? "Word2Vec" : 
                      type === "glove" ? "GloVe" : "Contextual (BERT-like)");
        });
        
        // Create SVG
        this.svg = this.container.append("svg")
            .attr("width", this.width)
            .attr("height", this.height - 40); // Adjust for controls
            
        // Create group for embedding points
        this.pointsGroup = this.svg.append("g");
        
        // We'll create tooltips on demand instead of reusing a single tooltip
        // to avoid circular references
    }
    
    update(nlpPipeline, tokens) {
        // Ensure we have valid pipeline and tokens
        if (!nlpPipeline || !tokens || !tokens.length) {
            console.error("Invalid NLP pipeline or tokens:", nlpPipeline, tokens);
            return;
        }
        
        // Generate embeddings for each type
        const embeddingTypes = ["word2vec", "glove", "contextual"];
        const embeddings = {};
        
        for (const type of embeddingTypes) {
            // Set embedding type
            nlpPipeline.embeddingType = type;
            
            // Generate embeddings
            const embeddingResults = nlpPipeline.generateEmbeddings(tokens);
            
            // Store embeddings
            embeddings[type] = embeddingResults.embeddingDetails;
        }
        
        // Reset pipeline to original embedding type
        nlpPipeline.embeddingType = this.embeddingSelect.property("value");
        
        // Store embedding data
        this.currentEmbeddingData = { embeddings, tokens };
        
        // Display first embedding type by default
        this.updateEmbeddingSpace({ embeddings, tokens }, "word2vec");
    }
    
    updateEmbeddingSpace(data, embeddingType) {
        const { embeddings, tokens } = data;
        const embeddingDetails = embeddings[embeddingType];
        
        // Project embeddings to 2D
        const projectedEmbeddings = this.projectEmbeddings(embeddingDetails);
        
        // Clear previous visualization
        this.svg.selectAll("*").remove();
        
        // Create scales
        const xExtent = d3.extent(projectedEmbeddings, d => d.x);
        const yExtent = d3.extent(projectedEmbeddings, d => d.y);
        
        const xScale = d3.scaleLinear()
            .domain([xExtent[0] - 0.1, xExtent[1] + 0.1])
            .range([this.margin.left, this.width - this.margin.right]);
            
        const yScale = d3.scaleLinear()
            .domain([yExtent[0] - 0.1, yExtent[1] + 0.1])
            .range([this.height - this.margin.bottom - 40, this.margin.top]); // Adjust for controls
            
        // Add axes
        this.svg.append("g")
            .attr("transform", `translate(0,${this.height - this.margin.bottom - 40})`)
            .call(d3.axisBottom(xScale));
            
        this.svg.append("g")
            .attr("transform", `translate(${this.margin.left},0)`)
            .call(d3.axisLeft(yScale));
            
        // Add axis labels
        this.svg.append("text")
            .attr("x", this.width / 2)
            .attr("y", this.height - 10)
            .attr("text-anchor", "middle")
            .text("Dimension 1 (PCA)");
            
        this.svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("x", -(this.height - 40) / 2)
            .attr("y", 15)
            .attr("text-anchor", "middle")
            .text("Dimension 2 (PCA)");
            
        // Add title
        this.svg.append("text")
            .attr("x", this.width / 2)
            .attr("y", 20)
            .attr("text-anchor", "middle")
            .attr("font-size", "14px")
            .attr("font-weight", "bold")
            .text(`${embeddingType === "word2vec" ? "Word2Vec" : 
                   embeddingType === "glove" ? "GloVe" : "Contextual (BERT-like)"} Embedding Space`);
            
        // Add embedding points
        this.pointsGroup = this.svg.append("g");
        
        this.pointsGroup.selectAll("circle")
            .data(projectedEmbeddings)
            .enter()
            .append("circle")
            .attr("cx", d => xScale(d.x))
            .attr("cy", d => yScale(d.y))
            .attr("r", 5)
            .attr("fill", "#4285f4")
            .attr("stroke", "white")
            .attr("stroke-width", 1)
            .on("mouseover", (event, d) => {
                // Create a new tooltip instead of reusing this.tooltip
                // to avoid circular references
                d3.selectAll(".embedding-tooltip").remove();
                
                const tooltip = d3.select("body").append("div")
                    .attr("class", "tooltip embedding-tooltip")
                    .style("position", "absolute")
                    .style("background-color", "white")
                    .style("border", "1px solid #dadce0")
                    .style("border-radius", "4px")
                    .style("padding", "5px")
                    .style("pointer-events", "none")
                    .style("opacity", 0);
                
                tooltip.transition()
                    .duration(200)
                    .style("opacity", 0.9);
                    
                tooltip.html(`Token: ${d.token}`)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", () => {
                // Remove tooltip
                d3.selectAll(".embedding-tooltip").remove();
            });
            
        // Add token labels
        this.pointsGroup.selectAll("text")
            .data(projectedEmbeddings)
            .enter()
            .append("text")
            .attr("x", d => xScale(d.x))
            .attr("y", d => yScale(d.y) - 10)
            .attr("text-anchor", "middle")
            .attr("font-size", "10px")
            .text(d => d.token);
    }
    
    projectEmbeddings(embeddingDetails) {
        // Simplified PCA projection to 2D
        // In reality, we would use a proper PCA algorithm
        
        const projectedEmbeddings = [];
        
        for (const detail of embeddingDetails) {
            const embedding = detail.embedding;
            
            // Use first two dimensions as a simple projection
            // In a real implementation, we would compute principal components
            let x = 0;
            let y = 0;
            
            if (embedding.length >= 2) {
                // Use first two dimensions with some mixing
                x = embedding[0];
                y = embedding[1];
                
                // Add some influence from other dimensions
                for (let i = 2; i < Math.min(10, embedding.length); i++) {
                    x += embedding[i] * 0.05 * Math.cos(i);
                    y += embedding[i] * 0.05 * Math.sin(i);
                }
            }
            
            projectedEmbeddings.push({
                token: detail.token,
                x,
                y,
                originalEmbedding: embedding
            });
        }
        
        return projectedEmbeddings;
    }
    
    resize() {
        const rect = this.container.node().getBoundingClientRect();
        this.width = Math.max(300, rect.width || 300);
        this.height = Math.max(300, rect.height || 300);
        
        this.svg.attr("width", this.width).attr("height", this.height - 40);
        
        // Re-render current embedding space
        if (this.currentEmbeddingData) {
            const selectedType = this.embeddingSelect.property("value");
            this.updateEmbeddingSpace(this.currentEmbeddingData, selectedType);
        }
    }
}

/**
 * Token Prediction Visualization
 * Visualizes token prediction probabilities
 */
class TokenPredictionViz {
    constructor(containerId) {
        this.container = d3.select(`#${containerId}`);
        this.init();
    }
    
    init() {
        // Clear previous content
        this.container.html("");
        
        // Create container for last token
        this.lastTokenContainer = this.container.append("div")
            .attr("class", "last-token-container")
            .style("margin-bottom", "20px");
            
        // Create container for predictions
        this.predictionsContainer = this.container.append("div")
            .attr("class", "predictions-container");
    }
    
    update(predictionResults) {
        // Ensure we have valid prediction results
        if (!predictionResults || !predictionResults.predictions) {
            console.error("Invalid prediction results:", predictionResults);
            return;
        }
        
        const { lastToken, predictions } = predictionResults;
        
        // Clear previous content
        this.lastTokenContainer.html("");
        this.predictionsContainer.html("");
        
        // Display last token
        this.lastTokenContainer.append("div")
            .style("margin-bottom", "10px")
            .html(`<strong>Last Token:</strong> "${lastToken}"`);
            
        // Display predictions heading
        this.predictionsContainer.append("div")
            .style("margin-bottom", "10px")
            .html("<strong>Predicted Next Tokens:</strong>");
            
        // Create container for prediction tokens
        const tokensContainer = this.predictionsContainer.append("div")
            .style("display", "flex")
            .style("flex-wrap", "wrap")
            .style("gap", "20px")
            .style("margin-bottom", "30px");
            
        // Display predictions
        predictions.forEach(prediction => {
            const tokenContainer = tokensContainer.append("div")
                .style("position", "relative")
                .style("text-align", "center");
                
            // Token
            tokenContainer.append("div")
                .attr("class", "prediction-token")
                .style("background-color", "#f8f9fa")
                .style("border", "1px solid #dadce0")
                .style("border-radius", "4px")
                .style("padding", "10px 15px")
                .style("margin-bottom", "25px")
                .text(prediction.token);
                
            // Probability bar
            const barContainer = tokenContainer.append("div")
                .style("position", "absolute")
                .style("bottom", "0")
                .style("left", "0")
                .style("width", "100%")
                .style("height", "20px");
                
            barContainer.append("div")
                .style("height", "100%")
                .style("width", `${prediction.probability * 100}%`)
                .style("background-color", "#4285f4")
                .style("border-radius", "2px");
                
            // Probability text
            tokenContainer.append("div")
                .style("position", "absolute")
                .style("bottom", "0")
                .style("left", "0")
                .style("width", "100%")
                .style("text-align", "center")
                .style("font-size", "10px")
                .style("color", "white")
                .text(`${(prediction.probability * 100).toFixed(1)}%`);
        });
        
        // Add explanation
        this.predictionsContainer.append("div")
            .style("margin-top", "20px")
            .style("padding", "10px")
            .style("background-color", "#e8f0fe")
            .style("border-radius", "4px")
            .html("<strong>Note:</strong> These predictions show the most likely next tokens based on the current context. In a real language model, these would be generated from a large neural network trained on vast amounts of text data.");
    }
}

// Export visualization classes
window.TokenizationViz = TokenizationViz;
window.EmbeddingViz = EmbeddingViz;
window.AttentionViz = AttentionViz;
window.PreprocessingViz = PreprocessingViz;
window.EmbeddingSpaceViz = EmbeddingSpaceViz;
window.TokenPredictionViz = TokenPredictionViz;