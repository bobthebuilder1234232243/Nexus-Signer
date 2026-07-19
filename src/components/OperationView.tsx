import React, { useState } from "react";
import { OperationState } from "./operations";
import { useTranslation } from "react-i18next";
import { GlassCard } from "./GlassCard";

interface OperationViewProps {
  operationState: OperationState;
  closeMenu: () => void;
}

export default function OperationView({ operationState, closeMenu }: OperationViewProps) {
  const { t } = useTranslation();
  
  // Track which specific failed step has its "More Details" section expanded
  const [expandedErrorStep, setExpandedErrorStep] = useState<string | null>(null);

  const operation = operationState.current;
  const { started, completed, failed } = operationState;

  // Determine if the operation is entirely finished or if it has failed
  const isFinished = operation.steps?.every((step) => completed.includes(step.id));
  const hasFailed = failed.length > 0;
  const isDone = isFinished || hasFailed;

  return (
    <div className="modal-overlay">
      <GlassCard className="modal-content operation-view">
        <div className="operation-header">
          <h2>{operation.name}</h2>
          {operation.description && <p className="subtitle">{operation.description}</p>}
        </div>

        <div className="operation-steps-list">
          {operation.steps?.map((step) => {
            const isCompleted = completed.includes(step.id);
            const isStarted = started.includes(step.id) && !isCompleted;
            const failure = failed.find((f) => f.stepId === step.id);
            const isFailed = !!failure;

            // Determine the visual status indicator
            let statusIcon = "⚪"; // Waiting
            let statusClass = "waiting";
            
            if (isFailed) {
              statusIcon = "❌";
              statusClass = "failed";
            } else if (isCompleted) {
              statusIcon = "✅";
              statusClass = "completed";
            } else if (isStarted) {
              statusIcon = "⏳";
              statusClass = "started";
            }

            return (
              <div key={step.id} className={`operation-step ${statusClass}`}>
                <div className="step-main">
                  <span className="step-icon">{statusIcon}</span>
                  <span className="step-label">{step.name}</span>
                </div>

                {/* Render error details only if this specific step failed */}
                {isFailed && failure?.extraDetails && (
                  <div className="step-error-container">
                    <button
                      className="details-toggle-btn"
                      onClick={() => 
                        setExpandedErrorStep(expandedErrorStep === step.id ? null : step.id)
                      }
                    >
                      {expandedErrorStep === step.id 
                        ? t("operations.hide_details", "Hide Details") 
                        : t("operations.show_details", "More Details")}
                    </button>
                    
                    {expandedErrorStep === step.id && (
                      <div className="error-log-box">
                        <pre>{failure.extraDetails}</pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Show close button only when the process finishes or fails */}
        {isDone && (
          <div className="operation-footer">
            <button className="primary-btn" onClick={closeMenu}>
              {t("app.close", "Close")}
            </button>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
