export default function ChecklistReporter() {
  return {
    onFinished(files /*: any[] */) {
      const checklist = {
        Search: 'KO',
        Widget: 'KO',
        POST: 'KO',
        GET: 'KO',
      }

      const allTasks = []

      const visit = (task) => {
        allTasks.push(task)
        if (task && Array.isArray(task.tasks)) task.tasks.forEach(visit)
      }

      if (Array.isArray(files)) files.forEach(visit)

      for (const task of allTasks) {
        const name = task?.name || task?.mode || ''
        const filePath = task?.file?.name || task?.filepath || ''
        const state = task?.result?.state || task?.state || ''

        const isPassed = state === 'pass' || state === 'passed' || state === 'success'

        if (isPassed) {
          if (filePath.includes('SearchControl') || /search/i.test(name)) {
            checklist.Search = 'OK'
          }
          if (filePath.includes('filter.test') || /filterOrganizationsByType|widget/i.test(name)) {
            checklist.Widget = 'OK'
          }
          if (/saveData|POST/i.test(name)) {
            checklist.POST = 'OK'
          }
          if (/fetchData|GET/i.test(name)) {
            checklist.GET = 'OK'
          }
        }
      }

      // Print a concise checklist summary at the end
      // Use a distinctive header to scan in CI/output
      // Keep ASCII for portability
      // Example:
      // Summary Checklist
      // Search: OK
      // Widget: KO
      // POST: OK
      // Fetch: OK
      //
      const lines = [
        'Summary Checklist',
        `Search     ${checklist.Search}`,
        `Widget     ${checklist.Widget}`,
        `POST       ${checklist.POST}`,
        `GET        ${checklist.GET}`,
        ''
      ]
      // eslint-disable-next-line no-console
      console.log(lines.join('\n'))
    }
  }
}


