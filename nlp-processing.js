/**
 * NLP Pipeline Processing Functions
 * 
 * This file contains the core NLP processing functions for tokenization,
 * embedding generation, attention mechanism simulation, preprocessing,
 * and token prediction.
 */

// Common English stopwords
const STOPWORDS = new Set([
    'a', 'an', 'the', 'and', 'or', 'but', 'if', 'because', 'as', 'what',
    'which', 'this', 'that', 'these', 'those', 'then', 'just', 'so', 'than',
    'such', 'both', 'through', 'about', 'for', 'is', 'of', 'while', 'during',
    'to', 'from', 'in', 'on', 'at', 'by', 'with', 'about', 'against', 'between',
    'into', 'through', 'during', 'before', 'after', 'above', 'below', 'up',
    'down', 'out', 'off', 'over', 'under', 'again', 'further', 'then', 'once',
    'here', 'there', 'when', 'where', 'why', 'how', 'all', 'any', 'both',
    'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not',
    'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'can', 'will',
    'don', 'should', 'now', 'i', 'me', 'my', 'myself', 'we', 'our', 'ours',
    'ourselves', 'you', 'your', 'yours', 'yourself', 'yourselves', 'he', 'him',
    'his', 'himself', 'she', 'her', 'hers', 'herself', 'it', 'its', 'itself',
    'they', 'them', 'their', 'theirs', 'themselves', 'am', 'is', 'are', 'was',
    'were', 'be', 'been', 'being', 'have', 'has', 'had', 'having', 'do', 'does',
    'did', 'doing'
]);

// Common English subwords for subword tokenization simulation
const SUBWORDS = [
    'un', 're', 'in', 'im', 'ir', 'dis', 'en', 'em', 'non', 'de', 'pre',
    'pro', 'anti', 'ing', 'ly', 'ed', 'er', 'est', 'ize', 'ise', 'ful',
    'able', 'al', 'ial', 'ical', 'ation', 'ition', 'ment', 'ness', 'ism'
];

// Simple stemming rules (very simplified version of Porter stemmer)
const STEMMING_RULES = [
    { suffix: 'ing', replacement: '' },
    { suffix: 'ed', replacement: '' },
    { suffix: 'ly', replacement: '' },
    { suffix: 'ies', replacement: 'y' },
    { suffix: 'es', replacement: '' },
    { suffix: 's', replacement: '' },
    { suffix: 'ment', replacement: '' },
    { suffix: 'ness', replacement: '' },
    { suffix: 'ation', replacement: 'ate' },
    { suffix: 'ition', replacement: 'it' },
    { suffix: 'ize', replacement: '' },
    { suffix: 'ise', replacement: '' },
    { suffix: 'ful', replacement: '' },
    { suffix: 'able', replacement: '' },
    { suffix: 'al', replacement: '' }
];

/**
 * NLP Pipeline Class
 * Handles the processing of text through various NLP pipeline stages
 */
class NLPPipeline {
    constructor() {
        // Default settings
        this.tokenizationMethod = 'word';
        this.embeddingType = 'random';
        this.attentionHeads = 4;
        this.preprocessingSteps = {
            lowercase: true,
            punctuation: true,
            stopwords: false,
            stemming: false
        };
        
        // Pre-computed embeddings for common words (simplified simulation)
        this.precomputedEmbeddings = {
            word2vec: this.generatePrecomputedEmbeddings('word2vec'),
            glove: this.generatePrecomputedEmbeddings('glove'),
            contextual: {} // Will be computed on-the-fly
        };
        
        // Token prediction model (simplified)
        this.nextTokenProbabilities = this.generateNextTokenProbabilities();
    }
    
    /**
     * Update pipeline settings
     */
    updateSettings(settings) {
        if (settings.tokenizationMethod) {
            this.tokenizationMethod = settings.tokenizationMethod;
        }
        
        if (settings.embeddingType) {
            this.embeddingType = settings.embeddingType;
        }
        
        if (settings.attentionHeads) {
            this.attentionHeads = settings.attentionHeads;
        }
        
        if (settings.preprocessingSteps) {
            this.preprocessingSteps = {
                ...this.preprocessingSteps,
                ...settings.preprocessingSteps
            };
        }
    }
    
    /**
     * Process text through the NLP pipeline
     */
    processText(text) {
        // Apply preprocessing
        const preprocessingResults = this.applyPreprocessing(text);
        const processedText = preprocessingResults.processedText;
        
        // Tokenize text
        const tokenizationResults = this.tokenize(processedText);
        
        // Generate embeddings
        const embeddingResults = this.generateEmbeddings(tokenizationResults.tokens);
        
        // Simulate attention mechanism
        const attentionResults = this.simulateAttention(embeddingResults.embeddings, tokenizationResults.tokens);
        
        // Predict next tokens
        const predictionResults = this.predictNextTokens(tokenizationResults.tokens);
        
        // Return all results
        return {
            originalText: text,
            preprocessingResults,
            tokenizationResults,
            embeddingResults,
            attentionResults,
            predictionResults
        };
    }
    
    /**
     * Apply preprocessing steps to text
     */
    applyPreprocessing(text) {
        const steps = [];
        let processedText = text;
        
        // Track each preprocessing step
        steps.push({
            name: 'original',
            text: processedText
        });
        
        // Apply lowercase
        if (this.preprocessingSteps.lowercase) {
            processedText = processedText.toLowerCase();
            steps.push({
                name: 'lowercase',
                text: processedText
            });
        }
        
        // Remove punctuation
        if (this.preprocessingSteps.punctuation) {
            processedText = processedText.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '');
            steps.push({
                name: 'remove punctuation',
                text: processedText
            });
        }
        
        // Tokenize for stopword removal and stemming
        let tokens = processedText.split(/\s+/);
        
        // Remove stopwords
        if (this.preprocessingSteps.stopwords) {
            tokens = tokens.filter(token => !STOPWORDS.has(token));
            steps.push({
                name: 'remove stopwords',
                text: tokens.join(' ')
            });
        }
        
        // Apply stemming
        if (this.preprocessingSteps.stemming) {
            tokens = tokens.map(token => this.stemWord(token));
            steps.push({
                name: 'stemming',
                text: tokens.join(' ')
            });
        }
        
        // Final processed text
        processedText = tokens.join(' ');
        
        return {
            steps,
            processedText
        };
    }
    
    /**
     * Tokenize text based on selected method
     */
    tokenize(text) {
        let tokens = [];
        let tokenDetails = [];
        
        switch (this.tokenizationMethod) {
            case 'word':
                // Simple word tokenization
                tokens = text.split(/\s+/);
                tokenDetails = tokens.map(token => ({
                    token,
                    type: 'word'
                }));
                break;
                
            case 'subword':
                // Simplified subword tokenization
                const subwordResult = this.subwordTokenize(text);
                tokens = subwordResult.tokens;
                tokenDetails = subwordResult.tokenDetails;
                break;
                
            case 'character':
                // Character tokenization
                tokens = Array.from(text);
                tokenDetails = tokens.map(token => ({
                    token,
                    type: 'character'
                }));
                break;
                
            default:
                tokens = text.split(/\s+/);
                tokenDetails = tokens.map(token => ({
                    token,
                    type: 'word'
                }));
        }
        
        return {
            tokens,
            tokenDetails
        };
    }
    
    /**
     * Simplified subword tokenization
     */
    subwordTokenize(text) {
        // Start with word tokens
        const words = text.split(/\s+/);
        const tokens = [];
        const tokenDetails = [];
        
        // Process each word
        for (const word of words) {
            let processed = false;
            
            // Check for common subwords
            for (const subword of SUBWORDS) {
                if (word.startsWith(subword) && word.length > subword.length) {
                    tokens.push(subword);
                    tokenDetails.push({
                        token: subword,
                        type: 'subword',
                        position: 'prefix'
                    });
                    
                    tokens.push(word.slice(subword.length));
                    tokenDetails.push({
                        token: word.slice(subword.length),
                        type: 'subword',
                        position: 'suffix'
                    });
                    
                    processed = true;
                    break;
                } else if (word.endsWith(subword) && word.length > subword.length) {
                    tokens.push(word.slice(0, -subword.length));
                    tokenDetails.push({
                        token: word.slice(0, -subword.length),
                        type: 'subword',
                        position: 'prefix'
                    });
                    
                    tokens.push(subword);
                    tokenDetails.push({
                        token: subword,
                        type: 'subword',
                        position: 'suffix'
                    });
                    
                    processed = true;
                    break;
                }
            }
            
            // If no subwords found, keep the whole word
            if (!processed) {
                tokens.push(word);
                tokenDetails.push({
                    token: word,
                    type: 'word'
                });
            }
        }
        
        return {
            tokens,
            tokenDetails
        };
    }
    
    /**
     * Generate embeddings for tokens
     */
    generateEmbeddings(tokens) {
        const embeddings = [];
        const embeddingDetails = [];
        
        // Generate embeddings based on selected type
        for (const token of tokens) {
            let embedding;
            
            switch (this.embeddingType) {
                case 'random':
                    embedding = this.generateRandomEmbedding();
                    break;
                    
                case 'word2vec':
                    embedding = this.getWord2VecEmbedding(token);
                    break;
                    
                case 'glove':
                    embedding = this.getGloVeEmbedding(token);
                    break;
                    
                case 'contextual':
                    embedding = this.getContextualEmbedding(token, tokens);
                    break;
                    
                default:
                    embedding = this.generateRandomEmbedding();
            }
            
            embeddings.push(embedding);
            embeddingDetails.push({
                token,
                embedding,
                type: this.embeddingType
            });
        }
        
        return {
            embeddings,
            embeddingDetails
        };
    }
    
    /**
     * Generate a random embedding vector
     */
    generateRandomEmbedding(dimensions = 50) {
        return Array.from({ length: dimensions }, () => Math.random() * 2 - 1);
    }
    
    /**
     * Get Word2Vec-like embedding for a token
     */
    getWord2VecEmbedding(token) {
        // Check if we have a pre-computed embedding
        if (this.precomputedEmbeddings.word2vec[token]) {
            return this.precomputedEmbeddings.word2vec[token];
        }
        
        // Generate a new one and store it
        const embedding = this.generateRandomEmbedding();
        this.precomputedEmbeddings.word2vec[token] = embedding;
        return embedding;
    }
    
    /**
     * Get GloVe-like embedding for a token
     */
    getGloVeEmbedding(token) {
        // Check if we have a pre-computed embedding
        if (this.precomputedEmbeddings.glove[token]) {
            return this.precomputedEmbeddings.glove[token];
        }
        
        // Generate a new one and store it
        const embedding = this.generateRandomEmbedding();
        this.precomputedEmbeddings.glove[token] = embedding;
        return embedding;
    }
    
    /**
     * Get contextual embedding for a token
     */
    getContextualEmbedding(token, allTokens) {
        // Generate a context-aware embedding (simplified simulation)
        const tokenIndex = allTokens.indexOf(token);
        const contextKey = `${token}_${tokenIndex}_${allTokens.length}`;
        
        // Check if we have a pre-computed contextual embedding
        if (this.precomputedEmbeddings.contextual[contextKey]) {
            return this.precomputedEmbeddings.contextual[contextKey];
        }
        
        // Generate a base embedding
        const baseEmbedding = this.getWord2VecEmbedding(token);
        
        // Modify it based on position and context
        const contextualEmbedding = baseEmbedding.map(value => {
            // Add some position-based variation
            const positionFactor = (tokenIndex / allTokens.length) * 0.4;
            
            // Add some context-based variation
            let contextFactor = 0;
            if (tokenIndex > 0) {
                const prevToken = allTokens[tokenIndex - 1];
                const prevEmbedding = this.getWord2VecEmbedding(prevToken);
                contextFactor += prevEmbedding[0] * 0.1;
            }
            
            if (tokenIndex < allTokens.length - 1) {
                const nextToken = allTokens[tokenIndex + 1];
                const nextEmbedding = this.getWord2VecEmbedding(nextToken);
                contextFactor += nextEmbedding[0] * 0.1;
            }
            
            return value * (1 + positionFactor + contextFactor);
        });
        
        // Store the contextual embedding
        this.precomputedEmbeddings.contextual[contextKey] = contextualEmbedding;
        
        return contextualEmbedding;
    }
    
    /**
     * Simulate attention mechanism
     */
    simulateAttention(embeddings, tokens) {
        const numTokens = tokens.length;
        const attentionMatrices = [];
        
        // Generate attention matrices for each head
        for (let head = 0; head < this.attentionHeads; head++) {
            const attentionMatrix = [];
            
            // Generate attention scores for each token pair
            for (let i = 0; i < numTokens; i++) {
                const row = [];
                
                for (let j = 0; j < numTokens; j++) {
                    // Simplified attention score calculation
                    // In a real transformer, this would involve query-key dot products
                    let score;
                    
                    if (head === 0) {
                        // Head 0: Positional attention (closer tokens attend more to each other)
                        score = 1 / (1 + Math.abs(i - j));
                    } else if (head === 1) {
                        // Head 1: Forward attention (tokens attend more to previous tokens)
                        score = j <= i ? 1 / (1 + (i - j)) : 0.1;
                    } else if (head === 2) {
                        // Head 2: Backward attention (tokens attend more to following tokens)
                        score = j >= i ? 1 / (1 + (j - i)) : 0.1;
                    } else {
                        // Other heads: Semantic similarity (simplified)
                        const embedding1 = embeddings[i];
                        const embedding2 = embeddings[j];
                        
                        // Cosine similarity (simplified)
                        let dotProduct = 0;
                        for (let k = 0; k < embedding1.length; k++) {
                            dotProduct += embedding1[k] * embedding2[k];
                        }
                        
                        score = (dotProduct + 1) / 2; // Normalize to [0, 1]
                    }
                    
                    row.push(score);
                }
                
                // Normalize row (softmax)
                const sum = row.reduce((acc, val) => acc + val, 0);
                const normalizedRow = row.map(val => val / sum);
                
                attentionMatrix.push(normalizedRow);
            }
            
            attentionMatrices.push({
                head,
                matrix: attentionMatrix
            });
        }
        
        return {
            attentionMatrices,
            numHeads: this.attentionHeads
        };
    }
    
    /**
     * Predict next tokens
     */
    predictNextTokens(tokens, numPredictions = 5) {
        const lastToken = tokens[tokens.length - 1];
        const predictions = [];
        
        // Get probabilities for the next token
        const nextTokenProbs = this.nextTokenProbabilities[lastToken] || {};
        
        // Sort by probability
        const sortedTokens = Object.keys(nextTokenProbs).sort((a, b) => {
            return nextTokenProbs[b] - nextTokenProbs[a];
        });
        
        // Take top predictions
        for (let i = 0; i < Math.min(numPredictions, sortedTokens.length); i++) {
            const token = sortedTokens[i];
            predictions.push({
                token,
                probability: nextTokenProbs[token]
            });
        }
        
        // If we don't have enough predictions, add some random ones
        while (predictions.length < numPredictions) {
            const randomToken = this.getRandomToken();
            const randomProb = Math.random() * 0.1; // Low probability
            
            // Check if this token is already in predictions
            if (!predictions.some(p => p.token === randomToken)) {
                predictions.push({
                    token: randomToken,
                    probability: randomProb
                });
            }
        }
        
        return {
            lastToken,
            predictions
        };
    }
    
    /**
     * Get a random token
     */
    getRandomToken() {
        const commonWords = [
            'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'I',
            'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
            'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she',
            'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what'
        ];
        
        return commonWords[Math.floor(Math.random() * commonWords.length)];
    }
    
    /**
     * Generate pre-computed embeddings for common words
     */
    generatePrecomputedEmbeddings(type) {
        const commonWords = [
            'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'I',
            'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
            'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she',
            'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what',
            'natural', 'language', 'processing', 'model', 'data', 'learning', 'neural',
            'network', 'deep', 'machine', 'algorithm', 'training', 'text', 'word', 'sentence',
            'token', 'embedding', 'vector', 'matrix', 'attention', 'transformer', 'bert',
            'gpt', 'nlp', 'ai', 'artificial', 'intelligence', 'computer', 'science', 'research'
        ];
        
        const embeddings = {};
        
        // Generate embeddings for each word
        for (const word of commonWords) {
            if (type === 'word2vec') {
                // Word2Vec-like embeddings (more semantic)
                embeddings[word] = this.generateSemanticEmbedding(word);
            } else if (type === 'glove') {
                // GloVe-like embeddings (more co-occurrence based)
                embeddings[word] = this.generateCoOccurrenceEmbedding(word);
            } else {
                // Random embeddings
                embeddings[word] = this.generateRandomEmbedding();
            }
        }
        
        return embeddings;
    }
    
    /**
     * Generate semantic embedding (Word2Vec-like)
     */
    generateSemanticEmbedding(word) {
        // This is a simplified simulation
        // In reality, Word2Vec embeddings are learned from large corpora
        
        const embedding = this.generateRandomEmbedding();
        
        // Add some semantic structure
        // Words with similar meanings should have similar embeddings
        const semanticGroups = {
            pronouns: ['I', 'you', 'he', 'she', 'it', 'we', 'they', 'my', 'his', 'her', 'their'],
            articles: ['the', 'a', 'an'],
            prepositions: ['to', 'of', 'in', 'on', 'with', 'by', 'from', 'at'],
            conjunctions: ['and', 'but', 'or', 'that', 'as'],
            verbs: ['be', 'have', 'do', 'say', 'will', 'would'],
            ai: ['natural', 'language', 'processing', 'model', 'data', 'learning', 'neural',
                'network', 'deep', 'machine', 'algorithm', 'training', 'text', 'word', 'sentence',
                'token', 'embedding', 'vector', 'matrix', 'attention', 'transformer', 'bert',
                'gpt', 'nlp', 'ai', 'artificial', 'intelligence', 'computer', 'science', 'research']
        };
        
        // Find which group this word belongs to
        for (const [group, words] of Object.entries(semanticGroups)) {
            if (words.includes(word)) {
                // Add group-specific bias to embedding
                const groupIndex = Object.keys(semanticGroups).indexOf(group);
                
                // Modify first few dimensions based on group
                for (let i = 0; i < 5; i++) {
                    embedding[i] = 0.5 * embedding[i] + 0.5 * Math.sin(groupIndex * i);
                }
                
                break;
            }
        }
        
        return embedding;
    }
    
    /**
     * Generate co-occurrence embedding (GloVe-like)
     */
    generateCoOccurrenceEmbedding(word) {
        // This is a simplified simulation
        // In reality, GloVe embeddings are learned from co-occurrence statistics
        
        const embedding = this.generateRandomEmbedding();
        
        // Define some common co-occurrences
        const coOccurrences = {
            'the': ['quick', 'brown', 'fox', 'lazy', 'dog'],
            'natural': ['language', 'processing', 'intelligence'],
            'language': ['natural', 'processing', 'model'],
            'processing': ['natural', 'language', 'data'],
            'neural': ['network', 'deep', 'learning'],
            'deep': ['learning', 'neural', 'network'],
            'machine': ['learning', 'intelligence', 'algorithm'],
            'attention': ['mechanism', 'transformer', 'model'],
            'transformer': ['model', 'attention', 'bert', 'gpt'],
            'embedding': ['word', 'vector', 'token']
        };
        
        // If this word has defined co-occurrences
        if (coOccurrences[word]) {
            // Modify embedding based on co-occurrence patterns
            const coOccurringWords = coOccurrences[word];
            
            // Simple hash function for words
            const hashWord = (w) => {
                let hash = 0;
                for (let i = 0; i < w.length; i++) {
                    hash = (hash * 31 + w.charCodeAt(i)) % 1000;
                }
                return hash / 1000; // Normalize to [0, 1]
            };
            
            // Modify embedding based on co-occurring words
            for (let i = 0; i < embedding.length; i++) {
                let coOccurrenceFactor = 0;
                
                for (const coWord of coOccurringWords) {
                    coOccurrenceFactor += hashWord(coWord + i);
                }
                
                coOccurrenceFactor /= coOccurringWords.length;
                embedding[i] = 0.7 * embedding[i] + 0.3 * coOccurrenceFactor;
            }
        }
        
        return embedding;
    }
    
    /**
     * Generate next token probabilities
     */
    generateNextTokenProbabilities() {
        // This is a simplified language model
        // In reality, these probabilities would be learned from data
        
        return {
            'the': { 'quick': 0.3, 'brown': 0.2, 'lazy': 0.15, 'big': 0.1, 'small': 0.1 },
            'quick': { 'brown': 0.5, 'fox': 0.2, 'and': 0.1, 'dog': 0.1, 'cat': 0.1 },
            'brown': { 'fox': 0.6, 'dog': 0.2, 'bear': 0.1, 'is': 0.05, 'was': 0.05 },
            'fox': { 'jumps': 0.4, 'jumped': 0.3, 'is': 0.1, 'was': 0.1, 'and': 0.1 },
            'jumps': { 'over': 0.7, 'through': 0.1, 'around': 0.1, 'quickly': 0.05, 'slowly': 0.05 },
            'over': { 'the': 0.8, 'a': 0.1, 'many': 0.05, 'some': 0.05 },
            'lazy': { 'dog': 0.7, 'cat': 0.1, 'fox': 0.1, 'animal': 0.05, 'person': 0.05 },
            'dog': { 'is': 0.3, 'was': 0.2, 'jumps': 0.2, 'barks': 0.2, 'sleeps': 0.1 },
            'natural': { 'language': 0.8, 'intelligence': 0.1, 'process': 0.05, 'selection': 0.05 },
            'language': { 'processing': 0.5, 'model': 0.2, 'is': 0.1, 'understanding': 0.1, 'generation': 0.1 },
            'processing': { 'is': 0.3, 'involves': 0.2, 'requires': 0.2, 'uses': 0.2, 'enables': 0.1 },
            'is': { 'a': 0.3, 'the': 0.2, 'fascinating': 0.2, 'important': 0.1, 'challenging': 0.1 },
            'fascinating': { 'and': 0.4, 'because': 0.3, 'topic': 0.1, 'field': 0.1, 'subject': 0.1 }
        };
    }
    
    /**
     * Apply stemming to a word
     */
    stemWord(word) {
        // Apply stemming rules
        for (const rule of STEMMING_RULES) {
            if (word.endsWith(rule.suffix) && word.length > rule.suffix.length) {
                return word.slice(0, -rule.suffix.length) + rule.replacement;
            }
        }
        
        return word;
    }
}

// Create global instance
window.nlpPipeline = new NLPPipeline();