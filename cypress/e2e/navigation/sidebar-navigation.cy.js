describe('Sidebar Navigation', () => {
  beforeEach(() => {
    cy.visit('/')
    cy.wait(6000)

    cy.get('input[type="email"]').type('test@gmail.com')
    cy.get('input[type="password"]').type('12345678')
    cy.get('button[type="submit"]').click()
    cy.wait(2000)
  })

  it('should toggle sidebar on mobile', () => {
    // Set mobile viewport
    cy.viewport(375, 667)
    
    // Click hamburger menu
    cy.get('[data-testid="menu-button"], button[aria-label="Menu"]').click()
    cy.wait(300)

    // Sidebar should be visible
    cy.get('[data-testid="sidebar"]').should('be.visible')
    
    // Click close or outside to hide
    cy.get('body').click(0, 0)
    cy.wait(300)
  })

  it('should navigate to home from sidebar', () => {
    cy.contains('Trang chủ').click()
    cy.wait(1500)

    cy.url().should('include', '/home')
    cy.contains('Khóa học nổi bật').should('be.visible')
  })

  it('should navigate to my courses from sidebar', () => {
    cy.contains('Khóa học của tôi').click()
    cy.wait(1500)

    cy.contains('Khóa học của tôi').should('be.visible')
    cy.contains('Đang học').should('be.visible')
  })

  it('should navigate to explore from sidebar', () => {
    cy.contains('Khám phá').click()
    cy.wait(1500)

    cy.url().should('include', '/explore')
    cy.contains('Khám phá khóa học').should('be.visible')
  })

  it('should show admin links for admin users', () => {
    // Logout and login as admin
    cy.get('[data-testid="user-avatar"]').click()
    cy.contains('Đăng xuất').click()
    cy.wait(2000)

    // Login as admin
    cy.get('input[type="email"]').type('admin@gmail.com')
    cy.get('input[type="password"]').type('admin')
    cy.get('button[type="submit"]').click()
    cy.wait(2000)

    // Admin should see Dashboard link in sidebar
    cy.contains('Dashboard').should('be.visible')
  })

  it('should highlight active page in sidebar', () => {
    // Navigate to My Courses
    cy.contains('Khóa học của tôi').click()
    cy.wait(1500)

    // Sidebar link should be highlighted
    cy.contains('Khóa học của tôi').parent().should('have.class', 'active')
      .or('have.attr', 'aria-current', 'page')
  })

  it('should navigate to AI Learning Path', () => {
    cy.contains('Lộ trình AI', { matchCase: false }).then($link => {
      if ($link.length) {
        cy.wrap($link).click()
        cy.wait(1500)

        // Should show AI learning path page
        cy.contains('Lộ trình học').should('be.visible')
      }
    })
  })

  it('should collapse/expand sidebar on desktop', () => {
    cy.viewport(1280, 720)
    
    // Find collapse button (if exists)
    cy.get('[data-testid="sidebar-toggle"]').then($btn => {
      if ($btn.length) {
        cy.wrap($btn).click()
        cy.wait(300)

        // Sidebar should be collapsed (show only icons)
        cy.get('[data-testid="sidebar"]').should('have.class', 'collapsed')
      }
    })
  })
})
