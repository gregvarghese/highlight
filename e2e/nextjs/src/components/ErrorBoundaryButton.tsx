'use client'

import { ErrorBoundary, SampleBuggyButton } from '@highlight-run/react'

export default function ErrorBoundaryButton() {
	return (
		<ErrorBoundary>
			<SampleBuggyButton />
		</ErrorBoundary>
	)
}
