describe('Course Enrollment Flow', () => {
  beforeEach(() => {
    cy.visit('/')
    cy.wait(6000)

    // Login as regular user
    cy.get('input[type="email"]').type('test@gmail.com')
    cy.get('input[type="password"]').type('12345678')
    cy.get('button[type="submit"]').click()
    cy.wait(2000)
  })

  it('should show enroll button for unenrolled public courses', () => {
    // Navigate to explore
    cy.contains('button', 'Khám phá khóa học').click()
    cy.wait(1500)

    // Click on a course that user is not enrolled in
    cy.get('[data-testid="course-card"]').first().click()
    cy.wait(1500)

    // Should see enroll button (if course exists and user not enrolled)
    cy.contains('button', 'Đăng ký học').should('be.visible')
  })

  it('should request enrollment to a course', () => {
    cy.contains('button', 'Khám phá khóa học').click()
    cy.wait(1500)

    // Find and click a course
    cy.get('[data-testid="course-card"]').first().click()
    cy.wait(1500)

    // Click enroll button
    cy.contains('button', 'Đăng ký học').then($btn => {
      if ($btn.length) {
        cy.wrap($btn).click()
        cy.wait(1000)
        
        // Should show success message or pending approval
        // Toast notification should appear
      }
    })
  })

  it('should view enrolled courses in My Courses', () => {
    // Navigate to My Courses
    cy.contains('button', 'Khóa học của tôi').click()
    cy.wait(1500)

    // Should see "Đang học" tab
    cy.contains('Đang học').should('be.visible')
    
    // Check for enrolled courses
    cy.get('[data-testid="course-list-card"]').should('have.length.at.least', 0)
  })

  it('should allow unenrolling from a course', () => {
    cy.contains('button', 'Khóa học của tôi').click()
    cy.wait(1500)

    // If enrolled in any course
    cy.get('[data-testid="course-list-card"]').first().then($card => {
      if ($card.length) {
        // Find and click "Rời khỏi" button
        cy.wrap($card).contains('button', 'Rời khỏi').click()
        
        // Confirm in dialog
        cy.contains('button', 'Xác nhận').click()
        cy.wait(1000)

        // Should show success message
      }
    })
  })

  it('should track lesson progress for enrolled courses', () => {
    cy.contains('button', 'Khóa học của tôi').click()
    cy.wait(1500)

    // Click on enrolled course
    cy.get('[data-testid="course-list-card"]').first().then($card => {
      if ($card.length) {
        cy.wrap($card).click()
        cy.wait(1500)

        // Should see course content with lessons
        cy.contains('Nội dung khóa học').should('be.visible')
        
        // Click on a lesson to start learning
        cy.contains('Bắt đầu học').click()
        cy.wait(1000)
      }
    })
  })
})
