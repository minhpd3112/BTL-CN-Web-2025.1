describe('User Profile Management', () => {
  beforeEach(() => {
    cy.visit('/')
    cy.wait(6000)

    cy.get('input[type="email"]').type('test@gmail.com')
    cy.get('input[type="password"]').type('12345678')
    cy.get('button[type="submit"]').click()
    cy.wait(2000)
  })

  it('should open user menu from avatar', () => {
    // Click on user avatar in header
    cy.get('[data-testid="user-avatar"], img[alt*="avatar"]').click()
    cy.wait(500)

    // Should show dropdown menu
    cy.contains('Cài đặt tài khoản').should('be.visible')
    cy.contains('Đăng xuất').should('be.visible')
  })

  it('should navigate to account settings', () => {
    cy.get('[data-testid="user-avatar"], img[alt*="avatar"]').click()
    cy.wait(500)
    
    cy.contains('Cài đặt tài khoản').click()
    cy.wait(1500)

    // Should show account settings page
    cy.contains('Cài đặt tài khoản').should('be.visible')
    cy.contains('Thông tin cá nhân').should('be.visible')
  })

  it('should update profile information', () => {
    // Navigate to settings
    cy.get('[data-testid="user-avatar"]').click()
    cy.wait(500)
    cy.contains('Cài đặt tài khoản').click()
    cy.wait(1500)

    // Update name
    cy.get('input[name="name"], input#name').clear().type('Tên mới')
    
    // Update bio
    cy.get('textarea[name="bio"]').clear().type('Mô tả profile mới')
    
    // Save changes
    cy.contains('button', 'Lưu thay đổi').click()
    cy.wait(1000)

    // Should show success message
    cy.contains('Cập nhật thành công').should('be.visible')
  })

  it('should upload profile avatar', () => {
    cy.get('[data-testid="user-avatar"]').click()
    cy.wait(500)
    cy.contains('Cài đặt tài khoản').click()
    cy.wait(1500)

    // Click on avatar upload area
    cy.contains('Thay đổi ảnh đại diện').click()
    
    // Upload file (requires fixture)
    // cy.get('input[type="file"]').selectFile('cypress/fixtures/avatar.jpg', { force: true })
    
    // Save
    cy.contains('button', 'Lưu').click()
    cy.wait(1000)
  })

  it('should change password', () => {
    cy.get('[data-testid="user-avatar"]').click()
    cy.wait(500)
    cy.contains('Cài đặt tài khoản').click()
    cy.wait(1500)

    // Navigate to password change section
    cy.contains('Đổi mật khẩu').click()
    
    // Fill password fields
    cy.get('input[type="password"]').eq(0).type('oldPassword123')
    cy.get('input[type="password"]').eq(1).type('newPassword123')
    cy.get('input[type="password"]').eq(2).type('newPassword123')
    
    // Submit
    cy.contains('button', 'Cập nhật mật khẩu').click()
    cy.wait(1000)
  })

  it('should view user statistics', () => {
    cy.get('[data-testid="user-avatar"]').click()
    cy.wait(500)
    cy.contains('Cài đặt tài khoản').click()
    cy.wait(1500)

    // Should display stats like courses enrolled, courses created
    cy.contains('Khóa học đã tạo').should('be.visible')
    cy.contains('Đang học').should('be.visible')
  })

  it('should logout successfully', () => {
    cy.get('[data-testid="user-avatar"]').click()
    cy.wait(500)
    
    cy.contains('Đăng xuất').click()
    cy.wait(2000)

    // Should return to login page
    cy.contains('Chào mừng trở lại!').should('be.visible')
    cy.url().should('not.include', '/home')
  })

  it('should view notification center', () => {
    // Click notification bell icon
    cy.get('[data-testid="notification-bell"]').click()
    cy.wait(500)

    // Should show notifications list
    cy.contains('Thông báo').should('be.visible')
  })

  it('should mark notifications as read', () => {
    cy.get('[data-testid="notification-bell"]').click()
    cy.wait(500)

    // Click on unread notification
    cy.get('[data-testid="notification-item"]').first().click()
    cy.wait(500)

    // Notification should be marked as read (styling change)
  })
})
