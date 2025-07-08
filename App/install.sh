#!/bin/bash
# Script to run expo install without deprecation warnings
export NODE_OPTIONS='--no-deprecation'
npx expo install 