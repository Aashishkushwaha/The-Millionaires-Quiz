import React from "react";
import { ENV_VARS } from "../utils/utils";

const GameRules = () => {
  return (
    <div>
      <ul>
        <h2 className="modal__header">
          Below are the rules of {ENV_VARS.APP_NAME}
        </h2>
        {`Rule,Rule,Rule,Rule,Rule,Rule,Rule,Rule,Rule,Rule,Rule,Rule,Rule,RuleRule,Rule,Rule,Rule,Rule,Rule,Rule,Rule,Rule,Rule,Rule,Rule
                    Rule,Rule,Rule,Rule,Rule,Rule,Rule,Rule,Rule,Rule,Rule,Rule`
          .split(",")
          .map((el: string, i: number) => (
            <h1 key={`${el}${i + 1}`}>
              {`${el}${i + 1}.`} This is Rule {i + 1} {`${el}${i + 1}.`} This is
              Rule {i + 1} {`${el}${i + 1}.`} This is Rule {i + 1}{" "}
              {`${el}${i + 1}.`} This is Rule {i + 1} {`${el}${i + 1}.`} This is
              Rule {i + 1}
            </h1>
          ))}
      </ul>
    </div>
  );
};

export default GameRules;
