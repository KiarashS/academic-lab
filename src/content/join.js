// Content for the Join page.

const join = {
  intro: [
    'We are looking for students and postdocs who want to work on machine learning for scientific problems. Experience in either machine learning or a natural science is welcome; we do not expect both.',
  ],
  // Set `open: false` to show a position as filled without deleting it.
  openings: [
    {
      title: 'PhD students',
      open: true,
      text: 'Apply to the Example University PhD program in Computer Science and mention the lab in your statement. Applications are due December 15.',
      url: 'https://example.edu/apply',
    },
    {
      title: 'Postdoctoral researcher',
      open: true,
      text: 'A two-year position on uncertainty quantification, starting in 2027. Send a CV, a short research statement and the names of three references.',
    },
    {
      title: 'Undergraduate researchers',
      open: false,
      text: 'Example University undergraduates can join for course credit or summer funding. We are not taking new students this term.',
    },
  ],
  howToApply:
    'Email the PI with "Prospective student" or "Postdoc application" in the subject line. We read every message but may not be able to reply to all of them.',
}

export default join
