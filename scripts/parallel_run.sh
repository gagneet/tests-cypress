#!/bin/bash

echo "Tests #1" &&
cypress_version=$HOST npx cypress run --record --key $CYPRESS_DASHBOARD_KEY --parallel --ci-build-id $BITBUCKET_BUILD_NUMBER --spec cypress/tests/$TESTS # parallel tests &&
echo "Tests #2" &&
cypress_version=$HOST npx cypress run --record --key $CYPRESS_DASHBOARD_KEY --parallel --ci-build-id $BITBUCKET_BUILD_NUMBER --spec cypress/tests/$TESTS # parallel tests &&
echo "Tests #3" &&
cypress_version=$HOST npx cypress run --record --key $CYPRESS_DASHBOARD_KEY --parallel --ci-build-id $BITBUCKET_BUILD_NUMBER --spec cypress/tests/$TESTS # parallel tests &&
# echo "Tests #4" &&
# cypress_version=$HOST npx cypress run --record --key $CYPRESS_DASHBOARD_KEY --parallel --ci-build-id $BITBUCKET_BUILD_NUMBER --spec cypress/tests/$TESTS # parallel tests &&
# echo "Tests #5" &&
# cypress_version=$HOST npx cypress run --record --key $CYPRESS_DASHBOARD_KEY --parallel --ci-build-id $BITBUCKET_BUILD_NUMBER --spec cypress/tests/$TESTS # parallel tests