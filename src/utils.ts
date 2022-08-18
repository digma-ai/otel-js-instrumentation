import os from 'os';
import { dirname } from 'path';
import finder from 'find-package-json';
import { diag } from '@opentelemetry/api';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { SemanticResourceDigmaAttributes } from './semanticResourceDigmaAttributes';

export function digmaAttributes(rootPath: string, digmaEnvironment?: string, commitId?: string) {
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

  const f = finder(rootPath);
  const pkg = f.next().value;
  if (pkg) {
    const packagePath = dirname(pkg.__path);
    attributes[SemanticResourceDigmaAttributes.PACKAGE_PATH] = packagePath;
    attributes[SemanticResourceDigmaAttributes.PACKAGE_NAME] = pkg.name!; // pkg.name is mandatory for the instrumentation to function correctly
  } else {
    diag.debug('package detector failed: Unable to find package path at', rootPath);
  }

  return attributes;
}
