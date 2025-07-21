/**
 * NLP Pipeline Visualizer - Main Application
 * 
 * This file contains the main application logic that initializes the NLP pipeline,
 * sets up the visualizations, and handles user interactions.
 */

// Main application class
class NLPPipelineApp {
    constructor() {
        // Get NLP pipeline instance
        this.nlpPipeline = window.nlpPipeline;
        
        // Initialize visualizations
        this.initVisualizations();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Process initial text
        // Wait for DOM to be fully loaded before processing text
        setTimeout(() => {
            this.processText();
        }, 500);
    }
    
    initVisualizations() {
        // Create visualization instances
        this.tokenizationViz = new TokenizationViz('tokenization-viz');
        this.embeddingViz = new EmbeddingViz('embedding-viz');
        this.attentionViz = new AttentionViz('attention-viz');
        this.preprocessingViz = new PreprocessingViz('preprocessing-viz');
        this.embeddingSpaceViz = new EmbeddingSpaceViz('embedding-space-viz');
        this.tokenPredictionViz = new TokenPredictionViz('prediction-viz');
        
        // Handle window resize
        window.addEventListener('resize', () => {
            this.resizeVisualizations();
        });
    }
    
    setupEventListeners() {
        // Process button
        document.getElementById('process-button').addEventListener('click', () => {
            this.processText();
        });
        
        // Clear button
        document.getElementById('clear-button').addEventListener('click', () => {
            document.getElementById('text-input').value = '';
        });
        
        // Tokenization method select
        document.getElementById('tokenizer-select').addEventListener('change', (e) => {
            this.nlpPipeline.tokenizationMethod = e.target.value;
            this.processText();
        });
        
        // Embedding type select
        document.getElementById('embedding-select').addEventListener('change', (e) => {
            this.nlpPipeline.embeddingType = e.target.value;
            this.processText();
        });
        
        // Attention heads slider
        document.getElementById('attention-heads').addEventListener('input', (e) => {
            document.getElementById('attention-heads-value').textContent = e.target.value;
            this.nlpPipeline.attentionHeads = parseInt(e.target.value);
            this.processText();
        });
        
        // Preprocessing checkboxes
        document.querySelectorAll('input[name="preprocessing"]').forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.updatePreprocessingSettings();
                this.processText();
            });
        });
        
        // Tab switching is handled directly in index.html
    }
    
    updatePreprocessingSettings() {
        const preprocessingSteps = {
            lowercase: false,
            punctuation: false,
            stopwords: false,
            stemming: false
        };
        
        // Get checkbox values
        document.querySelectorAll('input[name="preprocessing"]').forEach(checkbox => {
            preprocessingSteps[checkbox.value] = checkbox.checked;
        });
        
        // Update pipeline settings
        this.nlpPipeline.preprocessingSteps = preprocessingSteps;
    }
    
    processText() {
        try {
            // Get input text
            const text = document.getElementById('text-input').value;
            console.log("Processing text:", text);
            
            // Process text through NLP pipeline
            const results = this.nlpPipeline.processText(text);
            console.log("NLP pipeline results:", results);
            
            // Update visualizations
            this.updateVisualizations(results);
        } catch (error) {
            console.error("Error in processText:", error);
        }
    }
    
    updateVisualizations(results) {
        console.log("Updating visualizations with results:", results);
        
        try {
            // Update tokenization visualization
            console.log("Updating tokenization visualization with:", results.tokenizationResults);
            this.tokenizationViz.update(results.tokenizationResults);
        } catch (error) {
            console.error("Error updating tokenization visualization:", error);
        }
        
        try {
            // Update embedding visualization
            console.log("Updating embedding visualization with:", results.embeddingResults);
            this.embeddingViz.update(results.embeddingResults);
        } catch (error) {
            console.error("Error updating embedding visualization:", error);
        }
        
        try {
            // Update attention visualization
            console.log("Updating attention visualization with:", results.attentionResults);
            this.attentionViz.update(results.attentionResults, results.tokenizationResults.tokens);
        } catch (error) {
            console.error("Error updating attention visualization:", error);
        }
        
        try {
            // Update preprocessing visualization
            console.log("Updating preprocessing visualization with:", results.preprocessingResults);
            this.preprocessingViz.update(results.preprocessingResults);
        } catch (error) {
            console.error("Error updating preprocessing visualization:", error);
        }
        
        try {
            // Update embedding space comparison
            console.log("Updating embedding space visualization with tokens:", results.tokenizationResults.tokens);
            this.embeddingSpaceViz.update(this.nlpPipeline, results.tokenizationResults.tokens);
        } catch (error) {
            console.error("Error updating embedding space visualization:", error);
        }
        
        try {
            // Update token prediction visualization
            console.log("Updating token prediction visualization with:", results.predictionResults);
            this.tokenPredictionViz.update(results.predictionResults);
        } catch (error) {
            console.error("Error updating token prediction visualization:", error);
        }
        
        console.log("All visualizations updated");
    }
    
    resizeVisualizations() {
        try {
            // Only resize visualizations in the active tab
            const activeTabButton = document.querySelector('.tab-button.active');
            if (!activeTabButton) return;
            
            const activeTabId = activeTabButton.getAttribute('data-tab');
            
            // Resize visualizations that need it
            if (activeTabId === 'embedding') {
                this.embeddingViz.resize();
            } else if (activeTabId === 'attention') {
                this.attentionViz.resize();
            } else if (activeTabId === 'embedding-space') {
                this.embeddingSpaceViz.resize();
            }
            
            // If the active tab has a visualization that needs updating, process the text again
            if (['embedding', 'attention', 'embedding-space'].includes(activeTabId)) {
                this.processText();
            }
        } catch (error) {
            console.error("Error in resizeVisualizations:", error);
        }
    }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new NLPPipelineApp();
});