describe('Generar nueva paleta', function() {
    it('Generar una nueva paleta', function() {
        cy.visit('https://pedroasd.github.io/miso4208PruebasAutomaticas/index.html')
        
        cy.get('#btnRandom').click()
        cy.screenshot('gen-paleta-1')
        cy.get('#btnRandom').click()
        cy.screenshot('gen-paleta-2')
    })
})