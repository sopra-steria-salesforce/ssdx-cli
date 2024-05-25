#!/bin/sh

C='\033[1;33m'
RED='\033[1;31m'
YELLOW="\033[0;33m"
BLUE="\033[1;34m"
NC='\033[0m' # No Color

# SET ENV VARIABLES
###########################################################################
export SF_SKIP_NEW_VERSION_CHECK=true
export FORCE_SHOW_SPINNER=true
export SF_CAPITALIZE_RECORD_TYPES=true

# SET FOLDER
###########################################################################
cd -- "$(dirname "$BASH_SOURCE")"
folder=$(basename "`pwd`")
if [ $folder == "scripts" ]
then
    cd ..
fi
clear

echo "Starting...\n"

display_center(){
    t=$1
    COLUMNS=$(tput cols) 
    echo "$@" | fmt -c -w $COLUMNS

}

print_header() {
    t=$1
    echo "${C}\n\n"
    printf '%*s\n' "${COLUMNS:-$(tput cols)}" '' | tr ' ' -
    display_center "$@"
    printf '%*s\n' "${COLUMNS:-$(tput cols)}" '' | tr ' ' -
    echo "${NC}"
}

# CHECK DEVHUB
##########################################################################
auth_devhub(){
    echo "\n${YELLOW}Set a DevHub alias:${NC}"
    read -p 'Alias: ' DEVHUB
    npm run auth:devhub $DEVHUB
}
choose_devhub(){
    echo ""
    npx sf org:list --json | npx node-jq -r '(["Alias","Username","Instance","Status"] | (., map(length*"-"))), (.result.devHubs[] | [.alias, .username, .instanceUrl, .connectedStatus ]) | @tsv' | column -ts$'\t'
    echo "\n${YELLOW}Choose a DevHub (production login):${NC}"
    read -p 'Alias: ' DEVHUB
    echo ""
    npx sf config:set target-dev-hub=$DEVHUB
}

devhub_login(){
    echo "\n${RED}DevHub not authenticated. Do one of the following:${NC}"
    
    options=("Authenticate DevHub (by logging into production)" "Choose existing DevHub")
    select option in "${options[@]}"; do
        case $option in
            "Authenticate DevHub (by logging into production)") auth_devhub; break;;
            "Choose existing DevHub") choose_devhub; break;;
        esac
    done
}

devhub=$(npx sf config get target-dev-hub --json | npx node-jq -r '.result[0].value')
if [[ "$devhub" = "null" ]]; then
   devhub_login
fi

# CHECK SECRETS
##########################################################################
unlocked_packages=$(cat sfdx-project.json | npx node-jq -r 'try .packageDirectories[].dependencies[]')
if [ ! -z "$unlocked_packages" ]; then
    FILE=.ssdx/.packageKey
    if [ ! -f "$FILE" ]; then
        echo "\n${RED}Package Key is missing. ${NC}"
        read -p 'What is the value? ' SECRET
        
        mkdir -p .ssdx
        echo $SECRET > .ssdx/.packageKey
        echo ""
    fi
fi

# SCRATCH ORG NAME AND DURATION
##########################################################################
SCRATCH_ORG=""
DURATION_DAYS=5

# Parse command-line options
while getopts ":hn:d:" opt; do
  case $opt in
    n) SCRATCH_ORG="$OPTARG"
    ;;
    d) DURATION_DAYS="$OPTARG"
      if [ $DURATION_DAYS -gt 30 ]; then
          print_header "Duration cannot be more than 30 days"
          exit
      fi
    ;;
    h) echo "Usage: createScratchOrg [-n scratch-org-name] [-d duration-in-days]. Default duration is 5 days" >&2
       exit
    ;;
    \?) echo "Invalid option -$OPTARG . Use -n for scratch org name and -d for duration" >&2
        exit
    ;;
  esac
done

if [ -z "$SCRATCH_ORG" ]; then
    print_header "Scratch Org Name"
    echo ""
    read -p 'Scratch org name: ' SCRATCH_ORG
fi

# DELETE OLD ORG
##########################################################################
oldScratchOrg=$(npx sf config get target-org --json | npx node-jq -r '.result[0].value')

delete_existing_org(){
    print_header "Deleting Scratch Org named '$oldScratchOrg'"
    output=`npx sf org delete scratch --no-prompt --target-org $oldScratchOrg 2>&1` || echo $output
    echo "✅ Done"
}

if [[ "$oldScratchOrg" != "null" ]]; then

    list=`npx sf org list --json | npx node-jq --arg oldScratchOrg "$oldScratchOrg" -r '.result.scratchOrgs[] | select(.alias == $oldScratchOrg and .status == "Active")'`

    # check if current org is a scratch org. if list is empty, the org is not a scratch org or already deleted
    if [[ ! -z "$list" ]]; then
        print_header "Delete old Scratch Org"
        echo ""
        echo "${RED}Do you want to delete the existing Scratch Org? ($oldScratchOrg)${NC}"
        select yn in "Yes" "No"; do
            case $yn in
                Yes ) delete_existing_org; break;;
                No ) break;;
            esac
        done
    fi
fi

# CREATE SCRATCH ORG
##########################################################################
create_scratch_org_from_snapshot(){
    SNAPSHOT=$(cat ./config/project-scratch-def-snapshot.json | npx node-jq -r '.snapshot')
    print_header "Creating Scratch Org named '$SCRATCH_ORG' from snapshot '$SNAPSHOT' with duration $DURATION_DAYS days"
    npx sf org create scratch --definition-file=./config/project-scratch-def-snapshot.json --alias $SCRATCH_ORG --duration-days $DURATION_DAYS --set-default --wait 45 2>&1
    echo "List<User> user = [SELECT Id FROM User WHERE Name = 'User User' LIMIT 1]; user[0].LanguageLocaleKey = 'en_US'; update user;" > language.apex
    npx sf apex run --file language.apex 2>&1
    rm -rf language.apex
}
create_normal_scratch_org(){
    print_header "Creating Scratch Org named '$SCRATCH_ORG' with duration $DURATION_DAYS days"
    npx sf org create scratch --definition-file=./config/project-scratch-def.json --alias $SCRATCH_ORG --duration-days $DURATION_DAYS --set-default --wait 20 2>&1
}


FILE=./config/project-scratch-def-snapshot.json
if [[ -f "$FILE" ]]; then
    print_header "Scratch Org Creation"
    echo ""
    echo "${YELLOW}Do you want to create a Scratch Org from a Snapshot?${NC}"
    echo "This is often faster, but new and not as much tested yet." && echo
    select yn in "Yes" "No"; do
        case $yn in
            Yes ) create_scratch_org_from_snapshot; break;;
            No ) create_normal_scratch_org; break;;
        esac
    done
else
    create_normal_scratch_org
fi

# DURATION START
###########################################################################
SECONDS=0

# INSTALLING DEPENDENCIES
###########################################################################
unlocked_packages=$(cat sfdx-project.json | npx node-jq -r 'try .packageDirectories[].dependencies[]')
if [ ! -z "$unlocked_packages" ]; then

    SECRETS=""
    KEY=$(cat .ssdx/.packageKey)
    for dependency in $(npx node-jq -c 'try .packageDirectories[].dependencies[]' ./sfdx-project.json); do
        packageName=$(echo $dependency | npx node-jq -r '.package')
        SECRETS+="$packageName:$KEY "
    done

    print_header "Installing Unlocked Packages"
    devhub_username=$(npx sf config get target-dev-hub --json | npx node-jq -r '.result[0].value')
    npx sfp dependency:install --installationkeys "$SECRETS" --targetusername $SCRATCH_ORG --targetdevhubusername $devhub_username
fi

# INSTALLING MANAGED PACKAGES
###########################################################################
managed_packages=$(cat config/ssdx-config.json | npx node-jq -r 'try .managed_packages[]')
if [ ! -z "$managed_packages" ]; then
    print_header "Installing Managed Packages"
    for PACKAGE_ID in $managed_packages; do
        echo "  - Installing $PACKAGE_ID"
        npx sf package install --no-prompt --publish-wait 60 --wait 60 --target-org=$SCRATCH_ORG --package=$PACKAGE_ID
    done
    echo "✅ Done"
fi

# PUSHING METADATA
###########################################################################
print_header "Pushing Metadata"
npx sf project:deploy:start --ignore-conflicts --concise --target-org $SCRATCH_ORG

# OPENING ORG
###########################################################################
npx sf org open --target-org=$SCRATCH_ORG >/dev/null 2>&1
url=$(npx sf org open --url-only --json | npx node-jq -r '.result.url')

# ASSINGNING PERMSETS
###########################################################################
PERMSETS=$(cat config/ssdx-config.json | npx node-jq -r '.permsets_to_assign[]')
if [ ! -z "$PERMSETS" ]; then
    print_header "Sleeping for 30 seconds 😴"
    sleep 30 >/dev/null 2>&1

    print_header "Assigning Permission Set"
    for PERMSET in $PERMSETS; do
        echo "  - Assigning $PERMSET"
        npx sf force user permset assign --perm-set-name=$PERMSET --target-org=$SCRATCH_ORG
    done
fi

# DURATION
###########################################################################
duration=$SECONDS
print_header "🚀 Done"
echo "Org is ready! ${BLUE}($((duration / 60)) minutes and $((duration % 60)) seconds elapsed)${NC}"