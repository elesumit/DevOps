pipeline{
    agent any

    tools{
        maven "MAVEN3"
        jdk "OracleJDK"
    }

    stages{
        stage ('fetch code'){
            steps{
                git branch: 'vp-rem', url: 'https://github.com/devopshydclub/vprofile-project.git'
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
    }
}
