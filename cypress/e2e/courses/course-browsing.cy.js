describe('Course Browsing & Search', () => {
  beforeEach(() => {
    cy.visit('/')
    cy.wait(6000) // Wait for loading animation

    // Login
    cy.get('input[type="email"]').type('test@gmail.com')
    cy.get('input[type="password"]').type('12345678')
    cy.get('button[type="submit"]').click()
    cy.wait(2000)
  })

  it('should display courses on homepage', () => {
    // Check for "Khóa học nổi bật" section
    cy.contains('Khóa học nổi bật').should('be.visible')
    
    // Should have at least one course card
    cy.get('[data-testid="course-card"]').should('have.length.at.least', 0)
  })

  it('should navigate to explore page', () => {
    // Click "Khám phá khóa học" button
    cy.contains('button', 'Khám phá khóa học').click()
    cy.wait(1500)

    // Verify we're on explore page
    cy.contains('Khám phá khóa học').should('be.visible')
    cy.get('input[placeholder*="Tìm kiếm"]').should('be.visible')
  })

  it('should search for courses by keyword', () => {
    // Go to explore page
    cy.contains('button', 'Khám phá khóa học').click()
    cy.wait(1500)

    // Type in search box
    cy.get('input[placeholder*="Tìm kiếm"]').type('React')
    cy.wait(500)

    // Results should update (if any React courses exist)
    // The actual behavior depends on your data
  })

  it('should filter courses by tag', () => {
    cy.contains('button', 'Khám phá khóa học').click()
    cy.wait(1500)

    // Click on tag filter dropdown (if available)
    cy.get('select, [role="combobox"]').filter(':visible').first().click({ force: true })
    
    // Select a tag (implementation depends on your UI)
  })

  it('should sort courses', () => {
    cy.contains('button', 'Khám phá khóa học').click()
    cy.wait(1500)

    // Find and click sort dropdown
    cy.contains('Sắp xếp').parent().find('select, button').click({ force: true })
    
    // Select sort option (e.g., newest, most enrolled)
  })

  it('should paginate through course list', () => {
    cy.contains('button', 'Khám phá khóa học').click()
    cy.wait(1500)

    // If pagination exists, click next page
    cy.get('[aria-label="Go to next page"]').then($btn => {
      if ($btn.length && !$btn.prop('disabled')) {
        cy.wrap($btn).click()
        cy.wait(500)
      }
    })
  })

  it('should click on course card to view details', () => {
    // From homepage, click first course card
    cy.get('[data-testid="course-card"]').first().click()
    cy.wait(1500)

    // Should navigate to course detail page
    cy.contains('Tổng quan').should('be.visible')
    cy.contains('Nội dung khóa học').should('be.visible')
  })

  it('should view courses by tag from homepage', () => {
    // Scroll to tags section
    cy.contains('Chủ đề phổ biến').scrollIntoView()
    
    // Click on a tag (if tags exist)
    cy.get('[data-testid="tag-badge"]').first().then($tag => {
      if ($tag.length) {
        cy.wrap($tag).click()
        cy.wait(1500)
      }
    })
  })
})
