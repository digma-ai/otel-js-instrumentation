import { SemanticResourceDigmaAttributes } from './semanticResourceDigmaAttributes';
import { diag } from '@opentelemetry/api';

import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import os from 'os';
import finder from 'find-package-json';

export function digmaAttributes(digmaEnvironment?: string, commitId?: string) {
  const attributes: Record<string, string> = {};

  const hostname = os.hostname();
  if (digmaEnvironment === undefined) {
    digmaEnvironment = `${hostname}[local]`;
  }
  attributes[SemanticResourceAttributes.HOST_NAME] = hostname;
  attributes[SemanticResourceDigmaAttributes.ENVIRONMENT] = digmaEnvironment;
  attributes[SemanticResourceAttributes.TELEMETRY_SDK_LANGUAGE] = 'JavaScript';

  if (commitId) {
    attributes[SemanticResourceDigmaAttributes.COMMIT_ID] = commitId;
  }

  const f = finder(__dirname);
  const pkg = f.next().value;
  if (pkg) {
    const packagePath = require('path').dirname(pkg.__path);
    attributes[SemanticResourceDigmaAttributes.PACKAGE_PATH] = packagePath;
  } else {
    diag.debug('package detector failed: Unable to find package path.');
  }

  return attributes;
}
