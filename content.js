(function() {
  // Function to compute accessible name from element contents
  function getAccessibleNameFromContents(element) {
    let name = ''

    for (const node of element.childNodes) {
      if (node.nodeType === Node.TEXT_NODE) {
        name += node.textContent
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node

        // Check for aria-labelledby
        const labelledby = el.getAttribute('aria-labelledby')
        if (labelledby) {
          const ids = labelledby.trim().split(/\s+/)
          const names = ids.map(id => {
            const labelElement = document.getElementById(id)
            return labelElement ? labelElement.textContent.trim() : ''
          }).filter(n => n)
          name += ' ' + names.join(' ')
          continue
        }

        // Check for aria-label
        const ariaLabel = el.getAttribute('aria-label')
        if (ariaLabel) {
          name += ' ' + ariaLabel
          continue
        }

        // Handle images with alt text
        if (el.tagName === 'IMG') {
          const alt = el.getAttribute('alt')
          if (alt !== null) {
            name += ' ' + alt
          }
          continue
        }

        // Recursively get name from child elements
        name += getAccessibleNameFromContents(el)
      }
    }

    return name
  }

  // Function to compute the accessible name of an element
  function getAccessibleName(element) {
    // Check aria-labelledby first (highest priority)
    const labelledby = element.getAttribute('aria-labelledby')
    if (labelledby) {
      const ids = labelledby.trim().split(/\s+/)
      const names = ids.map(id => {
        const labelElement = document.getElementById(id)
        return labelElement ? labelElement.textContent.trim() : ''
      }).filter(name => name)
      if (names.length > 0) {
        return names.join(' ')
      }
    }

    // Check aria-label (second priority)
    const ariaLabel = element.getAttribute('aria-label')
    if (ariaLabel) {
      return ariaLabel.trim()
    }

    // Compute from contents (fallback)
    return getAccessibleNameFromContents(element).trim()
  }

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
    const text = getAccessibleName(heading)
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
      text: 'Missing h1.',
      isValid: false,
      violations: ['The page must have at least one <h1> element.']
    })
  }
  // Create backdrop
  const backdrop = document.createElement('div')
  backdrop.id = 'outline-validator-backdrop'
  backdrop.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 99999;'

  // Create the modal window
  const modal = document.createElement('div')
  modal.id = 'outline-validator-modal'

  // Function to close modal
  const closeModal = () => {
    backdrop.remove()
    modal.remove()
    document.removeEventListener('keydown', escapeHandler)
  }

  // Close button
  const closeButton = document.createElement('button')
  closeButton.className = 'close-button'
  closeButton.innerHTML = '&times;'
  closeButton.addEventListener('click', closeModal)
  modal.appendChild(closeButton)

  // Close on backdrop click
  backdrop.addEventListener('click', closeModal)

  // Prevent modal content clicks from closing
  modal.addEventListener('click', (e) => {
    e.stopPropagation()
  })

  // Close on ESC key
  const escapeHandler = (e) => {
    if (e.key === 'Escape') {
      closeModal()
    }
  }
  document.addEventListener('keydown', escapeHandler)

  // Check if all items are valid and show success message
  const allValid = outline.every(item => item.isValid)
  if (allValid) {
    const successMessage = document.createElement('div')
    successMessage.className = 'success-message'
    successMessage.textContent = 'This webpage has a syntactically valid document outline.'
    modal.appendChild(successMessage)
  }

  const list = document.createElement('ul')
  outline.forEach((item, index) => {
    const li = document.createElement('li')
    // Handle spacing: level 0 (document-level) gets normal spacing, others get indentation
    li.style.marginLeft = item.level === 0 ? '0px' : `${(item.level - 1) * 20}px`
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
          // Display all violations with proper text escaping
          item.violations.forEach(v => {
            const violationDiv = document.createElement('div')
            violationDiv.textContent = v
            message.appendChild(violationDiv)
          })
          li.appendChild(message)
          button.setAttribute('aria-expanded', 'true')
        }
      })
      li.appendChild(button)
    }
    list.appendChild(li)
  })
  modal.appendChild(list)
  document.body.appendChild(backdrop)
  document.body.appendChild(modal)
})()
