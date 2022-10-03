pipeline{
    agent any

    tools{
        maven "MAVEN3"
        jdk " "
    }

    environment{

    }

    stages{
        stage ('fetch code'){
            steps{
                git branch: 'vp-rem', url: 'provide git repo url'
            }
        }
        stage('Build'){
            steps{
                sh'mvn install -DskipTests'
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
    }
}
