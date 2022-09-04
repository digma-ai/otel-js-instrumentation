import os from 'os';
import { dirname } from 'path';
import finder from 'find-package-json';
import { diag } from '@opentelemetry/api';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { SemanticResourceDigmaAttributes } from './semanticResourceDigmaAttributes';

type DigmaAttributesOptions = {
  rootPath: string
  digmaEnvironment?: string
  commitId?: string
  otherPackages: string[]
}

type AttributeValue = string | string[]

type Attributes = Record<string, AttributeValue>

export function digmaAttributes({
  rootPath,
  digmaEnvironment,
  commitId,
  otherPackages,
}: DigmaAttributesOptions) {
  const attributes: Attributes = {};

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

  if(otherPackages?.length > 0) {
    attributes[SemanticResourceDigmaAttributes.PACKAGE_OTHERS] = otherPackages;
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