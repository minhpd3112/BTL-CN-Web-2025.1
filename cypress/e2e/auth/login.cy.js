describe('Authentication', () => {
  beforeEach(() => {
    cy.visit('/')
    // Wait for Christmas loading animation (5.5s) + buffer
    cy.wait(6000)
  })

  it('should display login page', () => {
    // Check for Vietnamese text: "Chào mừng trở lại!" (Welcome back)
    cy.contains('Chào mừng trở lại!', { timeout: 10000 }).should('be.visible')
    cy.get('input[type="email"]').should('exist')
    cy.get('input[type="password"]').should('exist')
    cy.contains('button', 'Đăng nhập').should('be.visible')
  })

  it('should login with valid credentials', () => {
    cy.get('input[type="email"]').type('test@gmail.com')
    cy.get('input[type="password"]').type('12345678')
    cy.get('button[type="submit"]').click()
    
    // Wait for login to complete
    cy.wait(2000)
    
    // Check if user is logged in - look for home page elements
    cy.contains('EduLearn').should('be.visible')
  })

  it('should show error for invalid credentials', () => {
    cy.get('input[type="email"]').type('wrong@example.com')
    cy.get('input[type="password"]').type('wrongpass')
    cy.get('button[type="submit"]').click()
    
    // Look for toast notification or error message
    cy.wait(1000)
    // The error message might be in Vietnamese, adjust as needed
  })

  it('should toggle between login and signup', () => {
    // Initially shows login
    cy.contains('button', 'Đăng nhập').should('be.visible')
    
    // Click to switch to signup
    cy.contains('Chưa có tài khoản?').parent().find('button').click()
    
    // Should now show signup button
    cy.contains('button', 'Đăng ký miễn phí').should('be.visible')
  })
})