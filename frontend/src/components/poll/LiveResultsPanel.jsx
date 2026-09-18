import React from 'react';
import { ResultBar } from '../ui/ResultBar';
import { leadingOptionId, percentage, totalVotes } from '../../utils/poll';
export function LiveResultsPanel({ options, dimmed = false, emphasis = 'default', updatedOptionId = null, updateKey = 0 }) {
    const total = totalVotes(options);
    const leading = leadingOptionId(options);
    return (<div className={emphasis === 'compact' ? 'space-y-3' : 'space-y-5'}>
      {options.map((option) => <ResultBar key={option.id} label={option.label} votes={option.votes} percent={percentage(option.votes, total)} leading={option.id === leading} dimmed={dimmed} emphasis={emphasis} flashKey={option.id === updatedOptionId ? updateKey : 0}/>)}
    </div>);
}
