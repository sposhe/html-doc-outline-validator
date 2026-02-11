(function() {
  const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'))
  if (headings.length === 0) {
    alert('No headings found on this page.')
    return
  }
  let outline = []
  let h1Count = 0
  let previousLevel = null
  headings.forEach((heading, index) => {
    const level = parseInt(heading.tagName.substring(1))
    const text = heading.textContent.trim()
    let isValid = true
    let violations = []
    if (level === 1) {
      h1Count++
      if (h1Count > 1) {
        isValid = false
        violations.push('Only one <h1> is allowed on the page.')
      }
    }
    if (index === 0 && level > 2) {
      isValid = false
      violations.push('The first heading must be <h1> or <h2>.')
    }
    if (previousLevel !== null) {
      if (level > previousLevel + 1) {
        isValid = false
        violations.push(`Heading level should not skip levels. Found <h${level}> after <h${previousLevel}>.`)
      }
    }
    outline.push({
      level,
      text,
      isValid,
      violations
    })
    previousLevel = level
  })
  // Check if page has no h1
  if (h1Count === 0) {
    outline.unshift({
      level: 0,
      text: 'Document Error',
      isValid: false,
      violations: ['The page must have at least one <h1> element.']
    })
  }
  // Create the modal window
  const modal = document.createElement('div')
  modal.id = 'outline-validator-modal'
  // Close button
  const closeButton = document.createElement('button')
  closeButton.className = 'close-button'
  closeButton.innerHTML = '&times;'
  closeButton.addEventListener('click', () => {
    modal.remove()
  })
  modal.appendChild(closeButton)
  const list = document.createElement('ul')
  outline.forEach((item, index) => {
    const li = document.createElement('li')
    li.style.marginLeft = `${(item.level - 1) * 20}px`
    if (item.isValid) {
      li.className = 'valid'
      li.textContent = `<h${item.level}> ${item.text}`
    } else {
      li.className = 'invalid'
      const button = document.createElement('button')
      // Handle document-level errors (level 0)
      if (item.level === 0) {
        button.textContent = `${item.text} ⚠️`
      } else {
        button.textContent = `<h${item.level}> ${item.text} ⚠️`
      }
      button.setAttribute('aria-expanded', 'false')
      const violationId = `violation-message-${index}`
      button.setAttribute('aria-controls', violationId)
      button.addEventListener('click', function() {
        let message = li.querySelector('.violation-message')
        if (message) {
          message.remove()
          button.setAttribute('aria-expanded', 'false')
        } else {
          message = document.createElement('div')
          message.className = 'violation-message'
          message.id = violationId
          // Display all violations
          message.innerHTML = item.violations.map(v => `<div>${v}</div>`).join('')
          li.appendChild(message)
          button.setAttribute('aria-expanded', 'true')
        }
      })
      li.appendChild(button)
    }
    list.appendChild(li)
  })
  modal.appendChild(list)
  document.body.appendChild(modal)
})()
