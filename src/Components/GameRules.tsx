import React from 'react'

const GameRules = () => {
    return (
        <div>
            <ul>
                <h2>Below are the rules of {process.env.REACT_APP_APP_NAME}</h2>
                {
                    `Rule,Rule,Rule,Rule,Rule,Rule,Rule,Rule,Rule,Rule,Rule,Rule,Rule,RuleRule,Rule,Rule,Rule,Rule,Rule,Rule,Rule,Rule,Rule,Rule,Rule
                    Rule,Rule,Rule,Rule,Rule,Rule,Rule,Rule,Rule,Rule,Rule,Rule`.split(',').map((el:string, i:number) => (
                        <h1 key={`${el}${i+1}`}>{`${el}${i+1}.`} This is Rule {i+1} {`${el}${i+1}.`} This is Rule {i+1} {`${el}${i+1}.`} This is Rule {i+1} {`${el}${i+1}.`} This is Rule {i+1} {`${el}${i+1}.`} This is Rule {i+1}</h1>
                    ))
                }
            </ul>
        </div>
    )
}

export default GameRules
