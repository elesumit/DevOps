pipeline {
    agent any
    tools {
        maven "MAVEN3"
        jdk "OracleJDK"
	}

    environment {
        registryCredential = 'ecr:us-east-1:awscredentials'
        appRegistry = "950478239053.dkr.ecr.us-east-1.amazonaws.com/vprofileappimages"
        vprofileRegistry = "https://950478239053.dkr.ecr.us-east-1.amazonaws.com"
    }
    
  stages {
    stage ('fetch code'){
            steps{
                git branch: 'docker', url: 'https://github.com/devopshydclub/vprofile-project.git'
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

    stage('Build App Image') {
       steps {
       
         script {
                dockerImage = docker.build( appRegistry + ":$BUILD_NUMBER", "./Docker-files/app/multistage/")
             }

     }
    
    }
    
    stage('Upload App Image') {
          steps{
            script {
              docker.withRegistry( vprofileRegistry, registryCredential ) {
                dockerImage.push("$BUILD_NUMBER")
                dockerImage.push('latest')
              }
            }
          }
     }

  }
}