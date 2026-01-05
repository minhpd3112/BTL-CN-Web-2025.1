// ***********************************************
// Custom Cypress Commands for EduLearn Platform
// ***********************************************

// Login command - Standard email/password login
Cypress.Commands.add('login', (email = 'test@gmail.com', password = '12345678') => {
  cy.visit('/')
  cy.wait(6000) // Wait for Christmas loading animation
  cy.get('input[type="email"]').type(email)
  cy.get('input[type="password"]').type(password)
  cy.get('button[type="submit"]').click()
  cy.wait(2000) // Wait for login to complete
})

// Admin login
Cypress.Commands.add('loginAsAdmin', () => {
  cy.login('admin@gmail.com', 'admin')
})

// Login via API (faster, skips UI)
Cypress.Commands.add('loginViaAPI', (email, password) => {
  cy.request('POST', `${Cypress.env('apiUrl')}/auth/login`, {
    email,
    password
  }).then((response) => {
    if (response.body.success) {
      window.localStorage.setItem('auth_token', response.body.data.token)
      window.localStorage.setItem('user_data', JSON.stringify(response.body.data.user))
    }
  })
})

// Skip loading animation for faster tests
Cypress.Commands.add('skipLoading', () => {
  cy.wait(6500) // Christmas loading + buffer
})

// Check for toast notification
Cypress.Commands.add('checkToast', (message) => {
  cy.contains(message, { timeout: 5000 }).should('be.visible')
})

// Logout
Cypress.Commands.add('logout', () => {
  cy.get('[data-testid="user-avatar"]').click()
  cy.wait(500)
  cy.contains('Đăng xuất').click()
  cy.wait(2000)
})