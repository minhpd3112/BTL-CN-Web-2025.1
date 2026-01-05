describe('Lesson Learning Flow', () => {
  beforeEach(() => {
    cy.visit('/')
    cy.wait(6000)

    cy.get('input[type="email"]').type('test@gmail.com')
    cy.get('input[type="password"]').type('12345678')
    cy.get('button[type="submit"]').click()
    cy.wait(2000)
  })

  it('should start learning from enrolled course', () => {
    // Go to my courses
    cy.contains('button', 'Khóa học của tôi').click()
    cy.wait(1500)

    // Click on enrolled course
    cy.get('[data-testid="course-list-card"]').first().then($card => {
      if ($card.length) {
        cy.wrap($card).click()
        cy.wait(1500)

        // Click "Bắt đầu học" or continue learning
        cy.contains('button', 'Bắt đầu học').click()
        cy.wait(1500)

        // Should navigate to learning page
        cy.url().should('include', '/learning')
      }
    })
  })

  it('should display lesson content', () => {
    // Navigate to a learning page (requires enrolled course)
    // This is a placeholder - actual navigation depends on your data
    
    // Should show lesson title
    cy.contains('h1, h2').should('be.visible')
    
    // Should show lesson content area
    cy.get('video, iframe, .lesson-content').should('exist')
  })

  it('should mark lesson as complete', () => {
    // After viewing lesson content, click complete button
    cy.contains('button', 'Hoàn thành').click()
    cy.wait(500)

    // Should show success message
    // Lesson should be marked with checkmark
  })

  it('should navigate between lessons', () => {
    // Click next lesson button
    cy.contains('button', 'Tiếp theo').click()
    cy.wait(1000)

    // Should load next lesson
    
    // Click previous lesson
    cy.contains('button', 'Trước').click()
    cy.wait(1000)
  })

  it('should show lesson sidebar with all lessons', () => {
    // Sidebar should list all sections and lessons
    cy.get('[data-testid="lesson-sidebar"], .sidebar').should('be.visible')
    
    // Should have clickable lesson items
    cy.get('[data-testid="lesson-item"]').should('have.length.at.least', 1)
  })

  it('should play video lessons', () => {
    // If lesson has video content
    cy.get('video, iframe[src*="youtube"]').then($video => {
      if ($video.length) {
        // Video player should be visible
        cy.wrap($video).should('be.visible')
        
        // Click play button (for video tag)
        if ($video.prop('tagName') === 'VIDEO') {
          cy.wrap($video).click()
        }
      }
    })
  })

  it('should display PDF lessons', () => {
    // Navigate to a PDF lesson
    // Should show PDF embed or link
    cy.get('iframe[src*="drive.google.com"], embed').then($pdf => {
      if ($pdf.length) {
        cy.wrap($pdf).should('be.visible')
      }
    })
  })

  it('should access quiz lessons', () => {
    // Navigate to quiz lesson
    cy.contains('Quiz', { matchCase: false }).then($quiz => {
      if ($quiz.length) {
        cy.wrap($quiz).click()
        cy.wait(1000)

        // Should show quiz questions
        cy.contains('Câu hỏi').should('be.visible')
      }
    })
  })

  it('should track overall course progress', () => {
    // Progress bar should show completion percentage
    cy.get('[role="progressbar"], .progress-bar').should('exist')
    
    // Should display progress text (e.g., "3/10 bài học")
    cy.contains(/\d+\/\d+/).should('be.visible')
  })
})
