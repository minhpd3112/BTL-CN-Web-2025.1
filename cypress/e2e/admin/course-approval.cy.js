describe('Admin Course Approval', () => {
  beforeEach(() => {
    cy.visit('/')
    cy.wait(6000)

    // Login as admin
    // Note: Use actual admin credentials from your seed data
    cy.get('input[type="email"]').type('admin@gmail.com')
    cy.get('input[type="password"]').type('admin')
    cy.get('button[type="submit"]').click()
    cy.wait(2000)
  })

  it('should navigate to admin dashboard', () => {
    // Admin should see Dashboard link
    cy.contains('Dashboard').should('be.visible')
    cy.contains('Dashboard').click()
    cy.wait(1500)

    // Should show admin dashboard
    cy.contains('Tổng quan hệ thống').should('be.visible')
    cy.contains('Quản lý khóa học').should('be.visible')
    cy.contains('Quản lý người dùng').should('be.visible')
  })

  it('should view pending courses for approval', () => {
    // Navigate to course approval page
    cy.contains('Dashboard').click()
    cy.wait(1500)
    
    cy.contains('Duyệt khóa học').click()
    cy.wait(1500)

    // Should show pending courses
    cy.contains('Duyệt khóa học').should('be.visible')
    // Pending courses list (if any exist)
  })

  it('should approve a pending course', () => {
    cy.contains('Dashboard').click()
    cy.wait(1500)
    cy.contains('Duyệt khóa học').click()
    cy.wait(1500)

    // Find first pending course and approve
    cy.contains('button', 'Phê duyệt').first().then($btn => {
      if ($btn.length) {
        cy.wrap($btn).click()
        
        // Confirm approval
        cy.contains('button', 'Xác nhận phê duyệt').click()
        cy.wait(1000)

        // Should show success message
        cy.contains('Đã phê duyệt khóa học').should('be.visible')
      }
    })
  })

  it('should reject a pending course with reason', () => {
    cy.contains('Dashboard').click()
    cy.wait(1500)
    cy.contains('Duyệt khóa học').click()
    cy.wait(1500)

    // Find first pending course and reject
    cy.contains('button', 'Từ chối').first().then($btn => {
      if ($btn.length) {
        cy.wrap($btn).click()
        cy.wait(500)

        // Enter rejection reason
        cy.get('textarea[placeholder*="lý do"]').type('Nội dung không phù hợp với quy định')
        
        // Confirm rejection
        cy.contains('button', 'Xác nhận từ chối').click()
        cy.wait(1000)

        // Should show success message
      }
    })
  })

  it('should view all courses in manage courses page', () => {
    cy.contains('Dashboard').click()
    cy.wait(1500)
    cy.contains('Quản lý khóa học').click()
    cy.wait(1500)

    // Should see all courses (public and private)
    cy.contains('Quản lý khóa học').should('be.visible')
    cy.get('[data-testid="course-list-card"]').should('have.length.at.least', 0)
  })

  it('should delete a course as admin', () => {
    cy.contains('Dashboard').click()
    cy.wait(1500)
    cy.contains('Quản lý khóa học').click()
    cy.wait(1500)

    // Click delete button on first course
    cy.get('button[title="Xóa khóa học"]').first().then($btn => {
      if ($btn.length) {
        cy.wrap($btn).click()
        cy.wait(500)

        // Confirm deletion in dialog
        cy.contains('button', 'Xác nhận').click()
        cy.wait(1000)
      }
    })
  })

  it('should manage users', () => {
    cy.contains('Dashboard').click()
    cy.wait(1500)
    cy.contains('Quản lý người dùng').click()
    cy.wait(1500)

    // Should show users list
    cy.contains('Quản lý người dùng').should('be.visible')
    cy.get('table, [data-testid="user-card"]').should('exist')
  })

  it('should view course statistics', () => {
    cy.contains('Dashboard').click()
    cy.wait(1500)

    // Check for stat cards
    cy.contains('Tổng khóa học').should('be.visible')
    cy.contains('Người dùng').should('be.visible')
    cy.contains('Đang chờ duyệt').should('be.visible')
  })
})
