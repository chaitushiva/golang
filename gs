- echo "Waiting for CodePipeline 'other-pipeline' to succeed..."

      # Loop to check CodePipeline state
      - |
        while true; do
          STATUS=$(aws codepipeline get-pipeline-state --name other-pipeline --query 'stageStates[?latestExecution.status==`InProgress`]' --output text)
          if [[ "$STATUS" == "" ]]; then
            echo "CodePipeline 'other-pipeline' completed successfully."
            break
          else
            echo "CodePipeline 'other-pipeline' is still in progress. Waiting..."
            sleep 30  # Adjust sleep time as needed
          fi
        done
