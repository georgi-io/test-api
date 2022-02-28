package io.georgi.testapi

import akka.actor.ActorSystem
import akka.event.{Logging, LoggingAdapter}
import akka.http.scaladsl.marshallers.sprayjson.SprayJsonSupport
import akka.http.scaladsl.{Http, ServerBuilder}
import akka.http.scaladsl.model.{ContentTypes, HttpEntity}
import akka.http.scaladsl.server.Directives.logRequestResult
import akka.http.scaladsl.server.Route
import com.typesafe.config.{Config, ConfigFactory}
import akka.http.scaladsl.model.StatusCodes.*
import akka.http.scaladsl.server.Directives.*
import spray.json.{DefaultJsonProtocol, RootJsonFormat}

import scala.concurrent.ExecutionContext
import scala.io.StdIn

case class Message(message: String)

trait JsonSupport extends SprayJsonSupport with DefaultJsonProtocol {
  implicit val messageFormat: RootJsonFormat[Message] = jsonFormat1(Message.apply)
}

class API()(using system: ActorSystem, executor: ExecutionContext, logger: LoggingAdapter, config: Config) extends JsonSupport :
  val route: Route = {
    path("/") {
      get {
        val message = Message(config.getString("api.message"))
        complete(message)
      }
    }
  }

object TestAPI extends App :
  val cfg = ConfigFactory.load()

  given system: ActorSystem = ActorSystem("test-api-system")

  given executor: ExecutionContext = system.dispatcher

  given logger: LoggingAdapter = Logging(system, "test-api")

  given config: Config = cfg

  logger.info("TestAPI is starting")
  Http().newServerAt(cfg.getString("http.interface"), cfg.getInt("http.port")).bind(API().route)



