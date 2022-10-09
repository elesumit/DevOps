pipeline{
    agent any

    tools{
        maven "MAVEN3"
        jdk "OracleJDK"
    }

    stages{
        stage ('fetch code'){
            steps{
                git branch: 'vprofile_nexus', url: 'https://github.com/devopshydclub/vprofile-project.git'
            }
        }
    
        // stage to check the commit for sensitive info - eg: AWS credentials, API tokens are leaking, by using Trufflehog tool (docker imnage)
        stage('Check-Git-Secrets'){
                 steps{
               // sh 'docker pull gesellix/trufflehog'
                sh 'rm trufflehog || True'
                sh 'docker run -t gesellix/trufflehog --json https://github.com/devopshydclub/vprofile-project.git > trufflehog'
                sh 'cat trufflehog'
            }

        }

        // stage to check the 3rd party libraries vulnerabilities using OWASP dependency check tool
        stage('OWASP-Source-Code-Analysis'){
            steps{
                catchError(buildResult: 'SUCCESS', stageResult: 'FAILURE') {
                sh 'rm owasp* || True'
                sh 'wget "https://raw.githubusercontent.com/elesumit/DevOps/vprofile_nexus/OWASP-dependency-check.sh" '
                sh 'chmod +x OWASP-dependency-check.sh'
                sh 'bash OWASP-dependency-check.sh'
                }
            }

        }


        stage('Build'){
            steps{
                sh 'mvn install -DskipTests'
            }
            post {
                success{
                    echo "Now Archiving it"
                    archiveArtifacts artifacts: '**/target/*.war'
                }
            }
        }
        stage('UNIT TEST')  {
            steps{
                sh 'mvn test'
            }
        }
        stage('Checkstyle Analysis'){
            steps{
                sh 'mvn checkstyle:checkstyle'
            }
        }

        stage('Sonar Analysis') {
            environment {
                scannerHome = tool 'Sonar4.7'
            }
            steps {
               withSonarQubeEnv('Sonar') {
                   sh '''${scannerHome}/bin/sonar-scanner -Dsonar.projectKey=vprofile \
                   -Dsonar.projectName=vprofile \
                   -Dsonar.projectVersion=1.0 \
                   -Dsonar.sources=src/ \
                   -Dsonar.java.binaries=target/test-classes/com/visualpathit/account/controllerTest/ \
                   -Dsonar.junit.reportsPath=target/surefire-reports/ \
                   -Dsonar.jacoco.reportsPath=target/jacoco.exec \
                   -Dsonar.java.checkstyle.reportPaths=target/checkstyle-result.xml'''
              }
            }
        }

        stage("Quality Gate") {
            steps {
                timeout(time: 1, unit: 'HOURS') {
                    // Parameter indicates whether to set pipeline to UNSTABLE if Quality Gate fails
                    // true = set pipeline to UNSTABLE, false = don't
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        stage("Upload Artifacts"){
            steps {
            nexusArtifactUploader(
             nexusVersion: 'nexus3',
            protocol: 'http',
            nexusUrl: '172.31.25.7:8081',
            groupId: 'QA',
            version: "${env.BUILD_ID}-${env.BUILD_TIMESTAMP}",
            repository: 'maven-releases',
            credentialsId: 'NexusLogin',
            artifacts: [
                [artifactId: 'vproapp',
                classifier: '',
                file: 'target/vprofile-v2.war',
                type: 'war']
                ]
             )

            }
        }

    }
}