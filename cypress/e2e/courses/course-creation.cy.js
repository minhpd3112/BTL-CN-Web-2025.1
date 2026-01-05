describe('Course Management', () => {
  beforeEach(() => {
    // Login first
    cy.visit('http://localhost:3000')
    cy.get('input[type="email"]').type('instructor@example.com')
    cy.get('input[type="password"]').type('password123')
    cy.get('button[type="submit"]').click()
    cy.wait(1000) // Wait for login
  })

  it('should create a new course', () => {
    cy.contains('Create Course').click()
    
    cy.get('input[name="title"]').type('Introduction to TypeScript')
    cy.get('textarea[name="description"]').type('Learn TypeScript from scratch')
    cy.get('select[name="category"]').select('Programming')
    cy.get('input[name="level"]').check('beginner')
    
    cy.get('button[type="submit"]').click()
    
    cy.contains('Course created successfully').should('be.visible')
    cy.contains('Introduction to TypeScript').should('be.visible')
  })

  it('should display created courses', () => {
    cy.visit('http://localhost:5173/my-courses')
    cy.get('[data-testid="course-card"]').should('have.length.at.least', 1)
  })
})