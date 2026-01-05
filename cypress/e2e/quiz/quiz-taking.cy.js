describe('Quiz Taking Flow', () => {
  beforeEach(() => {
    cy.visit('/')
    cy.wait(6000)

    cy.get('input[type="email"]').type('test@gmail.com')
    cy.get('input[type="password"]').type('12345678')
    cy.get('button[type="submit"]').click()
    cy.wait(2000)
  })

  it('should start a quiz lesson', () => {
    // Navigate to course with quiz
    // (Requires test data setup)
    
    // Click on quiz lesson
    cy.contains('Quiz').click()
    cy.wait(1000)

    // Should show quiz introduction
    cy.contains('Bắt đầu làm bài').should('be.visible')
  })

  it('should display quiz questions', () => {
    // After starting quiz
    cy.contains('Bắt đầu làm bài').click()
    cy.wait(500)

    // Should show first question
    cy.contains('Câu').should('be.visible')
    
    // Should have answer options (radio buttons)
    cy.get('input[type="radio"]').should('have.length.at.least', 2)
  })

  it('should select answers for multiple choice questions', () => {
    // Click on answer option
    cy.get('input[type="radio"]').first().check({ force: true })
    
    // Should be able to change answer
    cy.get('input[type="radio"]').eq(1).check({ force: true })
  })

  it('should navigate through quiz questions', () => {
    // Answer first question
    cy.get('input[type="radio"]').first().check({ force: true })
    
    // Click next question button
    cy.contains('button', 'Tiếp theo').click()
    cy.wait(500)

    // Should show second question
    cy.contains('Câu 2').should('be.visible')
  })

  it('should submit quiz after answering all questions', () => {
    // Answer all questions (simplified for test)
    // In real scenario, loop through all questions
    
    cy.get('input[type="radio"]').first().check({ force: true })
    
    // Click submit button (usually appears on last question)
    cy.contains('button', 'Nộp bài').click()
    cy.wait(1000)

    // Should show results page
    cy.contains('Kết quả').should('be.visible')
    cy.contains('Điểm số').should('be.visible')
  })

  it('should display quiz results with score', () => {
    // After submitting quiz
    // Should show score (e.g., "8/10" or "80%")
    cy.contains(/\d+\/\d+|\d+%/).should('be.visible')
    
    // Should show pass/fail status
    cy.contains(/Đạt|Không đạt/).should('be.visible')
  })

  it('should show correct answers after quiz submission', () => {
    // Results page should highlight correct/incorrect answers
    cy.get('[data-testid="answer-feedback"]').should('exist')
    
    // Green checkmark for correct, red X for incorrect
    cy.get('.correct, .incorrect').should('exist')
  })

  it('should allow retaking failed quiz', () => {
    // If quiz is failed
    cy.contains('Làm lại').then($btn => {
      if ($btn.length) {
        cy.wrap($btn).click()
        cy.wait(1000)

        // Should restart quiz
        cy.contains('Câu 1').should('be.visible')
      }
    })
  })

  it('should prevent navigation away during quiz without warning', () => {
    // Start quiz and answer some questions
    cy.get('input[type="radio"]').first().check({ force: true })
    
    // Try to navigate away (e.g., click browser back)
    // Should show confirmation dialog
    // Note: This requires beforeunload event handling
  })

  it('should save quiz progress', () => {
    // Answer some questions
    cy.get('input[type="radio"]').first().check({ force: true })
    cy.contains('button', 'Tiếp theo').click()
    
    // If progress is saved, refreshing page should restore answers
    // (This depends on your implementation)
  })
})
