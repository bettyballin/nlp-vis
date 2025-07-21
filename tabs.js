/**
 * Tab Switching Functionality
 * 
 * This file contains the code for handling tab switching in the NLP Pipeline Visualizer.
 */

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log("Initializing tab functionality");
    
    // Get all tab buttons
    const tabButtons = document.querySelectorAll('.tab-button');
    
    // Get all tab panes
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    // Add click event listeners to each tab button
    tabButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            console.log("Tab button clicked:", this.getAttribute('data-tab'));
            
            // Remove active class from all buttons
            tabButtons.forEach(btn => {
                btn.classList.remove('active');
            });
            
            // Remove active class from all panes and hide them
            tabPanes.forEach(pane => {
                pane.classList.remove('active');
                pane.style.display = 'none';
            });
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Get the tab ID and activate the corresponding pane
            const tabId = this.getAttribute('data-tab');
            const tabPane = document.getElementById(tabId);
            
            console.log("Tab ID:", tabId);
            console.log("Tab pane found:", tabPane ? "Yes" : "No");
            
            if (tabPane) {
                tabPane.classList.add('active');
                tabPane.style.display = 'block';
                console.log("Tab pane activated:", tabId);
                
                // Trigger a resize event to ensure visualizations are properly sized
                setTimeout(() => {
                    console.log("Triggering resize event for tab:", tabId);
                    window.dispatchEvent(new Event('resize'));
                }, 300);
            }
            
            // Prevent default behavior
            e.preventDefault();
        });
    });
    
    // Activate the first tab by default
    if (tabButtons.length > 0 && tabPanes.length > 0) {
        const firstTabId = tabButtons[0].getAttribute('data-tab');
        const firstTabPane = document.getElementById(firstTabId);
        
        if (firstTabPane) {
            tabButtons[0].classList.add('active');
            firstTabPane.classList.add('active');
            firstTabPane.style.display = 'block';
        }
    }
});